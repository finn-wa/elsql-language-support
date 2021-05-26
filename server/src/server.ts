import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  createConnection,
  DidChangeConfigurationNotification,
  Hover,
  HoverParams,
  InitializeParams,
  InitializeResult,
  Position,
  ProposedFeatures,
  Range,
  TextDocumentPositionParams,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import { onCompletion, onCompletionResolve } from './services/completions';
import { onHover } from './services/hovers';
import { onSignatureHelp } from './services/signature-help';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
      },
      hoverProvider: true,
      signatureHelpProvider: {
        triggerCharacters: ['('],
      },
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

/**
 * Retrieves the contents of the line in the document at the specified position.
 *
 * @param params Params containing document URI and position
 * @returns The line's contents as a string
 */
function getLine(params: TextDocumentPositionParams): string {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) {
    throw new Error('Failed to find document with uri ' + params.textDocument.uri);
  }
  const lineRange = Range.create(
    Position.create(params.position.line, 0),
    Position.create(params.position.line + 1, 0)
  );
  return doc.getText(lineRange);
}

connection.onCompletion(onCompletion);
connection.onCompletionResolve(onCompletionResolve);
connection.onHover((params) => onHover(params, getLine(params)));
connection.onSignatureHelp((params) => onSignatureHelp(params, getLine(params)));

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
