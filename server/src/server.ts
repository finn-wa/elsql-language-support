import {
  createConnection,
  InitializeParams,
  InitializeResult,
  ProposedFeatures,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import { handleCompletion } from './handlers/completion';
import { handleDefinition } from './handlers/definition';
import { handleHover } from './handlers/hover';
import { handleSignatureHelp } from './handlers/signature-help';
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

connection.onCompletion(handleCompletion);
connection.onHover((params) => handleHover(params, Files.getLine(params)));
connection.onSignatureHelp((params) => handleSignatureHelp(params, Files.getLine(params)));
connection.onDefinition((params) => handleDefinition(params, Files.getDocument(params)));

Files.listen(connection);
connection.listen();
