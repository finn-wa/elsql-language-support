import { Position, Range, TextDocumentPositionParams } from 'vscode-languageserver';

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
    textDocument: { uri: 'file://path/to/fake/document' },
    position: Position.create(line, character),
  };
}
