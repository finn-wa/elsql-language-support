import {
  Connection,
  Range,
  TextDocumentIdentifier,
  TextDocumentPositionParams,
  TextDocuments,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

interface TextDocumentParams {
  textDocument: TextDocumentIdentifier;
}

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

/**
 * Start listening for document changes.
 *
 * @param connection Connection to the client
 */
export function listen(connection: Connection): void {
  documents.listen(connection);
}

/**
 * Retrieves the document from the params, or throws an error if not found.
 *
 * @param uri The URI of the document to fetch
 * @returns
 */
export function getDocument(params: TextDocumentParams): TextDocument {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) {
    throw new Error('Failed to find document with uri ' + params.textDocument.uri);
  }
  return doc;
}

/**
 * Retrieves the contents of the line in the document at the specified position.
 *
 * @param params Params containing document URI and position
 * @returns The line's contents as a string
 */
export function getLine(params: TextDocumentPositionParams): string {
  const doc = getDocument(params);
  const lineRange = Range.create(params.position.line, 0, params.position.line + 1, 0);
  return doc.getText(lineRange);
}
