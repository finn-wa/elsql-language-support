import { Position } from 'vscode-languageserver-types';

/**
 * Overrides the index property to be required instead of optional.
 */
export interface MatchWithIndex extends RegExpMatchArray {
  index: number;
}

/**
 * Type guard which asserts that the index property is defined on a match.
 *
 * @param match The match
 * @returns True if the index is defined
 */
export function isMatchWithIndex(match: RegExpMatchArray): match is MatchWithIndex {
  return match.index !== undefined;
}

/**
 * Checks whether the supplied position is inside the bounds of the match text.
 *
 * @param match The match
 * @param pos The position
 * @returns True if the position is within the bounds of the match
 */
export function matchAtPosition(match: MatchWithIndex, pos: Position): boolean {
  return match.index <= pos.character && match.index + match[0].length >= pos.character;
}

/**
 * Returns all matches which contain the supplied position.
 *
 * @param text The text to find matches in
 * @param regex The regular expression
 * @param pos The position
 * @returns Array of matches
 */
export function matchAllAtPosition(text: string, regex: RegExp, pos: Position): MatchWithIndex[] {
  return Array.from(text.matchAll(regex)).filter(
    (match): match is MatchWithIndex => isMatchWithIndex(match) && matchAtPosition(match, pos)
  );
}

/**
 * Returns the first match which contains the supplied position.
 *
 * @param text The text to find matches in
 * @param regex The regular expression
 * @param pos The position
 * @returns The first match which contains the position, or null if none found.
 */
export function findMatchAtPosition(
  text: string,
  regex: RegExp,
  pos: Position
): MatchWithIndex | null {
  for (const match of text.matchAll(regex)) {
    if (isMatchWithIndex(match) && matchAtPosition(match, pos)) {
      return match;
    }
  }
  return null;
}
