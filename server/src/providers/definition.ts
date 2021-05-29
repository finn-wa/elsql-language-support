import { DefinitionParams } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DefinitionLink, Position, Range } from 'vscode-languageserver-types';
import * as Files from '../services/files';

const INCLUDE_PATTERN = /(?<=@INCLUDE\()[\w_]+(?=\))/g;
const NAME_PATTERN = /^@NAME\(([\w_]+)\)/gm;

interface OriginReference {
  blockName: string;
  originSelectionRange: Range;
}

interface MatchWithIndex extends RegExpMatchArray {
  length: 1;
  index: number;
}

function getOriginReference(line: string, pos: Position): OriginReference | null {
  const refMatch = Array.from(line.matchAll(INCLUDE_PATTERN)).find(
    (match): match is MatchWithIndex =>
      match.length === 1 &&
      match.index !== undefined &&
      match.index <= pos.character &&
      match.index + match[0].length >= pos.character
  );
  if (refMatch === undefined) {
    return null;
  }
  return {
    blockName: refMatch[0],
    originSelectionRange: Range.create(
      Position.create(pos.line, refMatch.index),
      Position.create(pos.line, refMatch.index + refMatch[0].length)
    ),
  };
}

function findDefinitionLink(reference: OriginReference, doc: TextDocument): DefinitionLink | null {
  const fullText = doc.getText();
  const regex = new RegExp(NAME_PATTERN);
  let match: RegExpExecArray | null = null;
  do {
    match = regex.exec(fullText);
    // Stop searching if target definition is found (or if nothing is found)
  } while (match !== null && match[1] !== reference.blockName);
  if (match === null) {
    return null; // Nothing found
  }

  const targetStart = doc.positionAt(match.index);
  const targetSelectionRange = Range.create(
    targetStart,
    Position.create(targetStart.line, targetStart.character + match[0].length)
  );

  const nextBlock = NAME_PATTERN.exec(fullText);
  const blockEndIndex = nextBlock === null ? fullText.length : nextBlock.index - 1;
  const targetRange = Range.create(targetStart, doc.positionAt(blockEndIndex));

  return {
    originSelectionRange: reference.originSelectionRange,
    targetUri: doc.uri,
    targetRange,
    targetSelectionRange,
  };
}

/**
 * Retrieves the definition of the symbol. Conveniently, ElSQL can only
 * reference definitions which are in the current file.
 *
 * @param params
 * @param doc
 * @returns
 */
export function provideDefinition(
  params: DefinitionParams,
  doc: TextDocument
): DefinitionLink[] | null {
  const reference = getOriginReference(Files.getLine(params), params.position);
  if (reference === null) {
    return null;
  }
  const definitionLink = findDefinitionLink(reference, doc);
  return definitionLink === null ? null : [definitionLink];
}
