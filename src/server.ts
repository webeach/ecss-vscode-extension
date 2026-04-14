import type {
  EcssStylesheet,
  StateDef,
  StateParam,
  StateVariant,
} from '@ecss/parser';
import type { LanguageService as CssLanguageService } from 'vscode-css-languageservice';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  Diagnostic,
  DiagnosticSeverity,
  Hover,
  MarkupKind,
  Position,
} from 'vscode-languageserver/node';

// ---------------------------------------------------------------------------
// Lazy parser loader — top-level require of a native module can crash the
// server process before it even sends the LSP initialize response.
// We load it once on first use and surface a clear error if it fails.
// ---------------------------------------------------------------------------

type ParseFn = (source: string) => EcssStylesheet;

let _parseEcss: ParseFn | null = null;
let _parserError: string | null = null;

function getParser(): ParseFn | null {
  if (_parserError !== null) {
    return null;
  }
  if (_parseEcss !== null) {
    return _parseEcss;
  }

  try {
    // Use the WASM build via the package exports field (`@ecss/parser/wasm`).
    // This avoids hardcoding internal file paths and works across package versions.
    // The WASM build has no native .node binary, so it works in any Electron version.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@ecss/parser/wasm') as typeof import('@ecss/parser');
    _parseEcss = mod.parseEcss;
    process.stderr.write(`[ecss-server] Loaded @ecss/parser WASM\n`);
    return _parseEcss;
  } catch (err: unknown) {
    _parserError = err instanceof Error ? err.message : String(err);
    process.stderr.write(
      `[ecss-server] Failed to load @ecss/parser WASM: ${_parserError}\n`,
    );
    return null;
  }
}

// Lazily created on first hover request — avoids crashing the server process
// at load time if the library has any Electron-incompatible initialization.
let _cssService: CssLanguageService | null = null;

function getCssService(): CssLanguageService | null {
  if (_cssService) {
    return _cssService;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCSSLanguageService } =
      require('vscode-css-languageservice') as typeof import('vscode-css-languageservice');
    _cssService = getCSSLanguageService();
    return _cssService;
  } catch (err: unknown) {
    process.stderr.write(
      `[ecss-server] Failed to load vscode-css-languageservice: ${err}\n`,
    );
    return null;
  }
}

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

interface CachedDoc {
  ast: EcssStylesheet;
  version: number;
}

const cache = new Map<string, CachedDoc>();

connection.onInitialize((_params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
    },
  };
});

// ---------------------------------------------------------------------------
// Parse + diagnostics
// ---------------------------------------------------------------------------

function parseDocument(doc: TextDocument): EcssStylesheet | null {
  const text = doc.getText();
  const uri = doc.uri;

  const parseEcss = getParser();
  if (!parseEcss) {
    connection.sendDiagnostics({
      uri,
      diagnostics: [
        {
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 1 },
          },
          message: `ECSS parser unavailable: ${_parserError}`,
          severity: DiagnosticSeverity.Warning,
          source: 'ecss',
        },
      ],
    });
    return null;
  }

  try {
    const ast = parseEcss(text);
    cache.set(uri, { ast, version: doc.version });
    connection.sendDiagnostics({ uri, diagnostics: [] });
    return ast;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const diagnostics: Diagnostic[] = [];

    // Parser error format: "[line:column] message"
    const match = msg.match(/^\[(\d+):(\d+)\]\s*(.+)$/);
    if (match) {
      const line = Math.max(0, parseInt(match[1], 10) - 1);
      const character = Math.max(0, parseInt(match[2], 10) - 1);
      diagnostics.push({
        range: {
          start: { line, character },
          end: { line, character: character + 1 },
        },
        message: match[3],
        severity: DiagnosticSeverity.Error,
        source: 'ecss',
      });
    } else {
      diagnostics.push({
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 1 },
        },
        message: msg,
        severity: DiagnosticSeverity.Error,
        source: 'ecss',
      });
    }

    connection.sendDiagnostics({ uri, diagnostics });
    cache.delete(uri);
    return null;
  }
}

documents.onDidChangeContent((change) => {
  parseDocument(change.document);
});

documents.onDidOpen((event) => {
  parseDocument(event.document);
});

documents.onDidClose((event) => {
  cache.delete(event.document.uri);
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

// ---------------------------------------------------------------------------
// Hover
// ---------------------------------------------------------------------------

function getAst(uri: string): EcssStylesheet | null {
  return cache.get(uri)?.ast ?? null;
}

/** Extract the word token under the cursor position in raw text. */
function getWordAtPosition(text: string, position: Position): string {
  const lines = text.split('\n');
  const line = lines[position.line] ?? '';
  const char = position.character;

  // Extend left and right to find word boundaries.
  // ECSS identifiers: --custom-prop, PascalCase names, plain idents
  const wordRe = /[-\w]/;

  let start = char;
  while (start > 0 && wordRe.test(line[start - 1])) {
    start--;
  }
  let end = char;
  while (end < line.length && wordRe.test(line[end])) {
    end++;
  }

  return line.slice(start, end);
}

/** Check if cursor (0-based line) is inside a span (1-based from parser). */
function cursorInSpan(
  cursorLine: number,
  span: { line: number; endLine: number },
): boolean {
  const spanStart = span.line - 1;
  const spanEnd = span.endLine - 1;
  return cursorLine >= spanStart && cursorLine <= spanEnd;
}

/** Find the @state-def whose body contains the cursor. */
function findEnclosingStateDef(
  ast: EcssStylesheet,
  cursorLine: number,
): StateDef | null {
  for (const rule of ast.rules) {
    if (rule.kind === 'state-def' && rule.stateDef) {
      if (cursorInSpan(cursorLine, rule.stateDef.span)) {
        return rule.stateDef;
      }
    }
  }
  return null;
}

/** Find @state-variant by name. */
function findVariant(ast: EcssStylesheet, name: string): StateVariant | null {
  for (const rule of ast.rules) {
    if (rule.kind === 'state-variant' && rule.stateVariant?.name === name) {
      return rule.stateVariant;
    }
  }
  return null;
}

function buildParamHover(param: StateParam, ast: EcssStylesheet): string {
  if (param.paramType === 'boolean') {
    const def = param.defaultValue ?? 'false';
    return [`**${param.name}**: \`boolean\``, '', `Default: \`${def}\``].join(
      '\n',
    );
  }

  // Variant
  const variantName = param.variantName ?? '?';
  const variant = findVariant(ast, variantName);
  const values = variant
    ? variant.values.map((v) => `\`"${v}"\``).join(' | ')
    : '_unknown_';
  const def = param.defaultValue ? `\`"${param.defaultValue}"\`` : '_none_';

  return [
    `**${param.name}**: \`${variantName}\` *(variant)*`,
    '',
    `Values: ${values}`,
    `Default: ${def}`,
  ].join('\n');
}

function buildVariantHover(variant: StateVariant): string {
  const values = variant.values.map((v) => `\`"${v}"\``).join(' | ');
  return [
    `**@state-variant** \`${variant.name}\``,
    '',
    `Values: ${values}`,
  ].join('\n');
}

/**
 * Delegate hover to vscode-css-languageservice for standard CSS properties.
 * The service parses the document as CSS (ECSS is a superset, so it's valid
 * enough for property lookups) and returns MDN-sourced documentation.
 */
function getCssHover(doc: TextDocument, position: Position): Hover | null {
  try {
    const svc = getCssService();
    if (!svc) {
      return null;
    }
    const stylesheet = svc.parseStylesheet(doc);
    const result = svc.doHover(doc, position, stylesheet, {
      documentation: true,
      references: true,
    });
    return result ?? null;
  } catch {
    return null;
  }
}

connection.onHover((params): Hover | null => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) {
    return null;
  }

  const ast = getAst(params.textDocument.uri);
  if (!ast) {
    return null;
  }

  const word = getWordAtPosition(doc.getText(), params.position);
  if (!word) {
    return null;
  }

  const cursorLine = params.position.line;

  // --param hover: look up inside enclosing @state-def
  if (word.startsWith('--')) {
    const stateDef = findEnclosingStateDef(ast, cursorLine);
    if (!stateDef) {
      return null;
    }

    const param = stateDef.params.find((p) => p.name === word);
    if (!param) {
      return null;
    }

    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: buildParamHover(param, ast),
      },
    };
  }

  // PascalCase: could be @state-variant name or @state-def name
  if (/^[A-Z][a-zA-Z0-9]*$/.test(word)) {
    // Check if it's a @state-variant
    const variant = findVariant(ast, word);
    if (variant) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: buildVariantHover(variant),
        },
      };
    }

    // Check if it's a @state-def
    for (const rule of ast.rules) {
      if (rule.kind === 'state-def' && rule.stateDef?.name === word) {
        const def = rule.stateDef;
        const paramList = def.params
          .map((p) => {
            if (p.paramType === 'boolean') {
              const defaultVal = p.defaultValue ?? 'false';
              return `${p.name} boolean: ${defaultVal}`;
            }
            const defaultVal = p.defaultValue ? `: "${p.defaultValue}"` : '';
            return `${p.name} ${p.variantName ?? '?'}${defaultVal}`;
          })
          .join(', ');
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: [
              `**@state-def** \`${def.name}\``,
              '',
              paramList ? `Parameters: \`(${paramList})\`` : '_no parameters_',
            ].join('\n'),
          },
        };
      }
    }
  }

  // Fallback: delegate to CSS language service for standard CSS property docs
  return getCssHover(doc, params.position);
});

documents.listen(connection);
connection.listen();
