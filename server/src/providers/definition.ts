import { DefinitionParams } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DefinitionLink, Position, Range } from 'vscode-languageserver-types';
import * as Files from '../services/files';
import { findMatchAtPosition } from '../utils/regex';
import { provideDocumentSymbols } from './document-symbol';

const INCLUDE_PATTERN = /(?<=@INCLUDE\()\w+(?=\))/g;

interface OriginReference {
  blockName: string;
  originSelectionRange: Range;
}

/**
 * Finds the @INCLUDE reference under the cursor (if present).
 *
 * @param line The contents of the line under the cursor
 * @param pos The cursor position
 * @returns The reference, or null if none found
 */
function getOriginReference(line: string, pos: Position): OriginReference | null {
  const refMatch = findMatchAtPosition(line, INCLUDE_PATTERN, pos);
  if (refMatch === null) {
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

/**
 * Finds the referenced @NAME block in the document.
 *
 * @param reference The @INCLUDE reference
 * @param doc The current document
 * @returns The DefinitionLink for the block, or null if not found
 */
function findDefinitionLink(reference: OriginReference, doc: TextDocument): DefinitionLink | null {
  const symbols = provideDocumentSymbols(doc);
  const targetIndex = symbols.findIndex((s) => s.name === reference.blockName);
  if (targetIndex === -1) {
    return null;
  }
  let targetRangeEnd: Position;
  if (targetIndex + 1 >= symbols.length) {
    targetRangeEnd = Position.create(doc.lineCount, 0);
  } else {
    const nextSymbolStart = symbols[targetIndex + 1].range.start;
    targetRangeEnd = Position.create(nextSymbolStart.line - 1, 0);
  }
  return {
    originSelectionRange: reference.originSelectionRange,
    targetUri: doc.uri,
    targetRange: Range.create(symbols[targetIndex].range.start, targetRangeEnd),
    targetSelectionRange: symbols[targetIndex].selectionRange,
  };
}

/**
 * Retrieves the definition of the symbol. Conveniently, ElSQL can only
 * reference definitions which are in the current file.
 *
 * @param params Definition params
 * @param doc The current document
 * @returns The definition link (or null if not applicable/invalid reference)
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
