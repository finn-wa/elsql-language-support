import {
  createConnection,
  InitializeParams,
  InitializeResult,
  ProposedFeatures,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import { provideCompletion } from './providers/completion';
import { provideDefinition } from './providers/definition';
import { provideHover } from './providers/hover';
import { provideSignatureHelp } from './providers/signature-help';
import * as Files from './services/files';

const connection = createConnection(ProposedFeatures.all);

connection.onInitialize((_params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: false,
      },
      definitionProvider: true,
      hoverProvider: true,
      signatureHelpProvider: {
        triggerCharacters: ['('],
      },
    },
  };
});

connection.onCompletion(provideCompletion);
connection.onHover((params) => provideHover(params, Files.getLine(params)));
connection.onSignatureHelp((params) => provideSignatureHelp(params, Files.getLine(params)));
connection.onDefinition((params) => provideDefinition(params, Files.getDocument(params)));

Files.listen(connection);
connection.listen();
