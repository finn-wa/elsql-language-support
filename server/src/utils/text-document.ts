import { Position, Range, TextDocumentPositionParams, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

/**
 * Retrieves the contents of the line in the document at the specified position.
 *
 * @param params Params containing document URI and position
 * @returns The line's contents as a string
 */
export function getLine(
  documents: TextDocuments<TextDocument>,
  params: TextDocumentPositionParams
): string {
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
