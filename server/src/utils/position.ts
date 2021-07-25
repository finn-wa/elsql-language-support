import { Position, Range } from 'vscode-languageserver';

/**
 * Creates a single line range from a starting position and a length.
 *
 * @param start Start position
 * @param rangeLength Length of range (characters)
 * @returns A new Range
 */
export function lineRange(start: Position, rangeLength: number) {
  return Range.create(start, Position.create(start.line, start.character + rangeLength));
}
