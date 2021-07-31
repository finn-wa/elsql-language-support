import { Position, Range, TextDocumentPositionParams } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

const fakeUri = 'file://path/to/fake/document.elsql';

/**
 * Creates a Position from the specified parameters and nests it in a fake
 * TextDocumentPositionParams object.
 *
 * @param line The position's line
 * @param character The position's character
 * @returns Position wrapped in TextDocumentPositionParams
 */
export function positionParams(line: number, character: number): TextDocumentPositionParams {
  return {
    textDocument: { uri: fakeUri },
    position: Position.create(line, character),
  };
}

/**
 * Creates a new text document.
 *
 * @param content The document's content.
 * @returns The document
 */
export function document(content: string): TextDocument {
  return TextDocument.create(fakeUri, 'elsql', 1, content);
}
