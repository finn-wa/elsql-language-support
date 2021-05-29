import { HoverParams } from 'vscode-languageserver-protocol';
import { Hover } from 'vscode-languageserver-types';
import { TAG_DOCS } from '../models/tags';
import * as TagUtils from '../utils/tag';

/**
 * Hover handler
 *
 * @param params HoverParams
 * @param line The line that the cursor is on
 * @returns A Hover, or null if none found
 */
export function provideHover(params: HoverParams, line: string): Hover | null {
  const pos = params.position;
  for (const match of line.matchAll(TagUtils.TAG_PATTERN)) {
    // Break if match start is past hover position
    if (match.index === undefined || match.index > pos.character) {
      break;
    }
    // Return docs if hover position is in match and match is a valid tag
    const matchText = match[0];
    if (match.index + matchText.length > pos.character && TagUtils.isValue(matchText)) {
      const tagDoc = TAG_DOCS[TagUtils.toName(matchText)];
      return { contents: tagDoc.detail };
    }
  }
  return null;
}
