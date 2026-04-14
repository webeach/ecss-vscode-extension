import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

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
  // Native and large deps that must be required at runtime, not bundled
  external: ['@ecss/parser', 'vscode-css-languageservice'],
};

if (watch) {
  const [extCtx, serverCtx] = await Promise.all([
    esbuild.context(extensionOptions),
    esbuild.context(serverOptions),
  ]);
  await Promise.all([extCtx.watch(), serverCtx.watch()]);
  console.log('Watching for changes...');
} else {
  await Promise.all([
    esbuild.build(extensionOptions),
    esbuild.build(serverOptions),
  ]);
}
