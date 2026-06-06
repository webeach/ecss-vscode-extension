import * as esbuild from 'esbuild';

import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const watch = process.argv.includes('--watch');
const isDev = process.argv.includes('--dev') || watch;

const wasmPkgDir = dirname(
  require.resolve('@ecss/parser-wasm32-wasi/package.json'),
);

mkdirSync('dist', { recursive: true });
copyFileSync(
  join(wasmPkgDir, 'ecss-parser.wasm32-wasi.wasm'),
  'dist/ecss-parser.wasm32-wasi.wasm',
);

// Sync the TextMate grammar from @ecss/grammar (the single source of truth)
// into syntaxes/, where `contributes.grammars.path` and the .vsix expect it.
mkdirSync('syntaxes', { recursive: true });
copyFileSync(
  require.resolve('@ecss/grammar/ecss.tmLanguage.json'),
  'syntaxes/ecss.tmLanguage.json',
);

const commonOptions = {
  bundle: true,
  platform: 'node',
  format: 'cjs',
  sourcemap: true,
  logLevel: 'info',
};

const extensionOptions = {
  ...commonOptions,
  entryPoints: ['src/extension.ts'],
  outfile: 'dist/extension.js',
  external: ['vscode'],
};

const serverOptions = {
  ...commonOptions,
  entryPoints: ['src/server.ts'],
  outfile: 'dist/server.js',
  // __DEV__ is a compile-time constant: esbuild tree-shakes the unused parser branch.
  // dev  → native @ecss/parser (kept external, loaded from workspace node_modules)
  // prod → @ecss/parser-wasm32-wasi (bundled inline by esbuild)
  define: { __DEV__: JSON.stringify(isDev) },
  external: ['vscode', ...(isDev ? ['@ecss/parser'] : [])],
};

const workerOptions = {
  entryPoints: [join(wasmPkgDir, 'wasi-worker.mjs')],
  outfile: 'dist/wasi-worker.mjs',
  bundle: true,
  platform: 'node',
  format: 'esm',
  sourcemap: true,
  logLevel: 'info',
};

if (watch) {
  const [extCtx, serverCtx, workerCtx] = await Promise.all([
    esbuild.context(extensionOptions),
    esbuild.context(serverOptions),
    esbuild.context(workerOptions),
  ]);
  await Promise.all([extCtx.watch(), serverCtx.watch(), workerCtx.watch()]);
  console.log('Watching for changes...');
} else {
  await Promise.all([
    esbuild.build(extensionOptions),
    esbuild.build(serverOptions),
    esbuild.build(workerOptions),
  ]);
}
