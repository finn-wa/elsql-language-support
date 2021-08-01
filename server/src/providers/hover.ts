import { Position, Range } from 'vscode-languageserver';
import { HoverParams } from 'vscode-languageserver-protocol';
import { Hover } from 'vscode-languageserver-types';
import { TAG_DOCS } from '../models/tag-docs';
import { FileService } from '../services/files';
import * as TagUtils from '../utils/tag';

/**
 * Hover handler
 *
 * @param line The line that the cursor is on
 * @param pos The position of the cursor
 * @returns A Hover, or null if none found
 */
export function getHover(line: string, pos: Position): Hover | null {
  for (const match of line.matchAll(TagUtils.TAG_PATTERN)) {
    // Break if match start is past hover position
    if (match.index === undefined || match.index > pos.character) {
      break;
    }
    // Return docs if hover position is in match and match is a valid tag
    const matchText = match[0];
    const matchEndIndex = match.index + matchText.length;
    if (matchEndIndex > pos.character && TagUtils.isValue(matchText)) {
      const tagDoc = TAG_DOCS[TagUtils.toName(matchText)];
      return {
        contents: tagDoc.detail,
        range: Range.create(pos.line, match.index, pos.line, matchEndIndex),
      };
    }
  }
  return null;
}

/**
 * Hover handler
 *
 * @param params HoverParams
 * @returns A Hover, or null if none found
 */
export function provideHover(params: HoverParams): Hover | null {
  return getHover(FileService.getLine(params), params.position);
}
