import { ExtensionContext, workspace, window } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  RevealOutputChannelOn,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';

import * as path from 'path';

let client: LanguageClient;

export function activate(context: ExtensionContext): void {
  const serverModule = context.asAbsolutePath(path.join('dist', 'server.js'));

  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ['--nolazy', '--inspect=6009'] },
    },
  };

  const outputChannel = window.createOutputChannel('ECSS Language Server');

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'ecss' }],
    synchronize: {
      fileEvents: [
        workspace.createFileSystemWatcher('**/*.ecss'),
        workspace.createFileSystemWatcher(
          '**/ecss.config.{ts,js,mts,mjs,cts,cjs}',
        ),
      ],
    },
    outputChannel,
    revealOutputChannelOn: RevealOutputChannelOn.Error,
  };

  client = new LanguageClient(
    'ecssLanguageServer',
    'ECSS Language Server',
    serverOptions,
    clientOptions,
  );

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
