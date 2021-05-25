import { HoverParams } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Hover, Position, Range } from 'vscode-languageserver-types';
import { TagDocs, TagUtils } from '../resources/tags';

const TAG_PATTERN = new RegExp(/@[A-Z]+/g);

export const onHover = (doc: TextDocument, params: HoverParams): Hover | null => {
  const pos = params.position;
  const lineText = doc.getText(
    Range.create(Position.create(pos.line, 0), Position.create(pos.line + 1, 0))
  );
  for (const match of lineText.matchAll(TAG_PATTERN)) {
    // Break if match start is past hover position
    if (match.index === undefined || match.index > pos.character) {
      break;
    }
    // Return docs if hover position is in match and match is a valid tag
    const matchText = match[0];
    if (match.index + matchText.length > pos.character && TagUtils.isValue(matchText)) {
      const tagDoc = TagDocs[TagUtils.toName(matchText)];
      return { contents: tagDoc.detail };
    }
  }
  return null;
};
