import { HoverParams } from 'vscode-languageserver-protocol';
import { Hover } from 'vscode-languageserver-types';
import { TagDocs, TagUtils } from '../resources/tags';

const TAG_DOCS = new TagDocs();
const TAG_PATTERN = new RegExp(/@[A-Z]+/g);

/**
 * Hover handler
 *
 * @param params HoverParams
 * @param line The line that the cursor is on
 * @returns A Hover, or null if none found
 */
export function onHover(params: HoverParams, line: string): Hover | null {
  const pos = params.position;
  for (const match of line.matchAll(TAG_PATTERN)) {
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
