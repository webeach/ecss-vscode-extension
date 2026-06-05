import { readConfigCache } from '@ecss/config';
import { createLanguageService, type ParseFn } from '@ecss/language-service';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  CompletionItemKind,
  createConnection,
  InitializeParams,
  InitializeResult,
  ProposedFeatures,
  TextDocumentSyncKind,
  TextDocuments,
} from 'vscode-languageserver/node';

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Parser ───────────────────────────────────────────────────────────────────
// __DEV__ is injected by esbuild at build time (see esbuild.mjs).
// dev  → native @ecss/parser (NAPI, workspace dep, kept external by esbuild)
// prod → @ecss/parser-wasm32-wasi (bundled inline; the other branch is tree-shaken)
declare const __DEV__: boolean;
const { parseEcss } = (
  __DEV__ ? require('@ecss/parser') : require('@ecss/parser-wasm32-wasi')
) as { parseEcss: ParseFn };

// ─── Connection + document manager ───────────────────────────────────────────

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

// ─── Language service ─────────────────────────────────────────────────────────

const languageService = createLanguageService({ parse: parseEcss });

// ─── Workspace root + config cache watcher ───────────────────────────────────

let workspaceRoot: string | null = null;
let configWatcher: fs.FSWatcher | null = null;

function loadCachedConfig(root: string): void {
  const cached = readConfigCache(root);
  languageService.updateConfig(cached ?? {});
}

function watchConfigCache(root: string): void {
  if (configWatcher) {
    configWatcher.close();
    configWatcher = null;
  }

  const cacheFile = path.join(root, '.ecss', 'config.json');

  // Watch the directory so we catch both create and modify events
  const watchDir = path.join(root, '.ecss');
  if (!fs.existsSync(watchDir)) {
    try {
      fs.mkdirSync(watchDir, { recursive: true });
    } catch {
      /* ignore */
    }
  }

  try {
    configWatcher = fs.watch(watchDir, (_eventType, filename) => {
      if (filename === 'config.json' && fs.existsSync(cacheFile)) {
        loadCachedConfig(root);
      }
    });
  } catch {
    // fs.watch may fail in some environments — silently ignore
  }
}

// ─── Initialize ──────────────────────────────────────────────────────────────

connection.onInitialize((_params: InitializeParams): InitializeResult => {
  const rootUri = _params.rootUri ?? _params.workspaceFolders?.[0]?.uri;
  if (rootUri) {
    try {
      workspaceRoot = fileURLToPath(rootUri);
      languageService.setProjectRoot(workspaceRoot);
      loadCachedConfig(workspaceRoot);
      watchConfigCache(workspaceRoot);
    } catch {
      /* non-file URI or other issue */
    }
  }

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
      definitionProvider: true,
      referencesProvider: true,
      documentSymbolProvider: true,
      completionProvider: {
        triggerCharacters: ['@', '-', '.', '"', "'", '/'],
        resolveProvider: false,
      },
    },
  };
});

// ─── Config file change (watched by VS Code client) ──────────────────────────

connection.onDidChangeWatchedFiles(() => {
  if (workspaceRoot) {
    loadCachedConfig(workspaceRoot);
  }
});

// ─── Document lifecycle ───────────────────────────────────────────────────────

documents.onDidOpen((event) => {
  const diagnostics = languageService.updateDocument(
    event.document.uri,
    event.document.getText(),
    event.document.version,
  );
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics });
});

documents.onDidChangeContent((event) => {
  const diagnostics = languageService.updateDocument(
    event.document.uri,
    event.document.getText(),
    event.document.version,
  );
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics });
});

documents.onDidClose((event) => {
  languageService.removeDocument(event.document.uri);
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

// ─── Hover ────────────────────────────────────────────────────────────────────

connection.onHover((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) {
    return null;
  }
  return (
    languageService.getHover(
      params.textDocument.uri,
      doc.getText(),
      params.position,
    ) ?? null
  );
});

// ─── Definition ──────────────────────────────────────────────────────────────

connection.onDefinition((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) {
    return null;
  }
  return (
    languageService.getDefinition(
      params.textDocument.uri,
      doc.getText(),
      params.position,
    ) ?? null
  );
});

// ─── References ──────────────────────────────────────────────────────────────

connection.onReferences((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) {
    return null;
  }
  return languageService.getReferences(
    params.textDocument.uri,
    doc.getText(),
    params.position,
  );
});

// ─── Completions ─────────────────────────────────────────────────────────────

connection.onCompletion((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) {
    return [];
  }
  const items = languageService.getCompletions(
    params.textDocument.uri,
    doc.getText(),
    params.position,
  );
  // Map insertTextFormat from numeric LSP values — pass through as-is
  return items.map((item) => ({
    ...item,
    kind: item.kind ?? CompletionItemKind.Text,
  }));
});

// ─── Document symbols ─────────────────────────────────────────────────────────

connection.onDocumentSymbol((params) => {
  return languageService.getDocumentSymbols(params.textDocument.uri);
});

// ─── Start ───────────────────────────────────────────────────────────────────

documents.listen(connection);
connection.listen();
