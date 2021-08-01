import {
  CompletionItem,
  createConnection,
  InitializeParams,
  InitializeResult,
  ProposedFeatures,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import { provideCompletion, resolveCompletion } from './providers/completion/completion';
import { provideDefinition } from './providers/definition';
import { provideDocumentSymbols } from './providers/document-symbol';
import { provideHover } from './providers/hover';
import { provideRename } from './providers/rename';
import { provideSignatureHelp } from './providers/signature-help';
import { FileService } from './services/files';

const connection = createConnection(ProposedFeatures.all);

connection.onInitialize((_params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['@', '('],
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
connection.onCompletionResolve(resolveCompletion);
connection.onDefinition(provideDefinition);
connection.onDocumentSymbol(provideDocumentSymbols);
connection.onHover(provideHover);
connection.onRenameRequest(provideRename);
connection.onSignatureHelp(provideSignatureHelp);

FileService.startDocumentListener(connection);
connection.listen();
