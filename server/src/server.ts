import {
  createConnection,
  InitializeParams,
  InitializeResult,
  ProposedFeatures,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import { provideCompletion } from './providers/completion';
import { provideDefinition } from './providers/definition';
import { provideDocumentSymbols } from './providers/document-symbol';
import { provideHover } from './providers/hover';
import { provideRename } from './providers/rename';
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
      documentSymbolProvider: true,
      hoverProvider: true,
      renameProvider: true,
      signatureHelpProvider: {
        triggerCharacters: ['('],
      },
    },
  };
});

connection.onCompletion(provideCompletion);
connection.onDefinition((params) => provideDefinition(params, Files.getDocument(params)));
connection.onDocumentSymbol((params) => provideDocumentSymbols(Files.getDocument(params)));
connection.onHover((params) => provideHover(params, Files.getLine(params)));
connection.onRenameRequest((params) => provideRename(params, Files.getDocument(params)));
connection.onSignatureHelp((params) => provideSignatureHelp(params, Files.getLine(params)));

Files.listen(connection);
connection.listen();
