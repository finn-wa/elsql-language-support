import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  createConnection,
  InitializeParams,
  InitializeResult,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import { handleCompletion, handleCompletionResolve } from './handlers/completion';
import { handleHover } from './handlers/hover';
import { handleSignatureHelp } from './handlers/signature-help';
import { getLine } from './utils/text-document';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
      },
      hoverProvider: true,
      signatureHelpProvider: {
        triggerCharacters: ['('],
      },
    },
  };
});

connection.onCompletion(handleCompletion);
connection.onCompletionResolve(handleCompletionResolve);
connection.onHover((params) => handleHover(params, getLine(documents, params)));
connection.onSignatureHelp((params) => handleSignatureHelp(params, getLine(documents, params)));

documents.listen(connection);
connection.listen();
