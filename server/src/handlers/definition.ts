import { DefinitionParams } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Definition, Position, Range } from 'vscode-languageserver-types';
import * as Files from '../services/files';

const REFERENCE_PATTERN = /@INCLUDE\((\w+)\)/g;

function parseReference(line: string, pos: Position): string | null {
  const refMatch = Array.from(line.matchAll(REFERENCE_PATTERN)).find(
    (match) =>
      match.length === 2 &&
      match.index !== undefined &&
      match.index <= pos.character &&
      match.index + match[0].length >= pos.character
  );
  if (refMatch === undefined) {
    return null;
  }
  return refMatch[1];
}

function findDefinition(blockName: string, doc: TextDocument): Range | null {
  const fullText = doc.getText();
  const definitionPattern = new RegExp(`^@NAME\\(${blockName}\\)`, 'gm');
  for (const match of fullText.matchAll(definitionPattern)) {
    if (match.index !== undefined) {
      const pos = doc.positionAt(match.index);
      return Range.create(pos, { line: pos.line, character: pos.character + match[0].length });
    }
  }
  return null;
}

/**
 * Retrieves the definition of the symbol. Conveniently, ElSQL can only
 * reference definitions which are in the current file.
 *
 * @param params
 * @param doc
 * @returns
 */
export function handleDefinition(params: DefinitionParams, doc: TextDocument): Definition | null {
  const line = Files.getLine(params);
  const blockName = parseReference(line, params.position);
  if (blockName === null) {
    return null;
  }
  const defRange = findDefinition(blockName, doc);
  if (defRange === null) {
    return null;
  }
  return { range: defRange, uri: doc.uri };
}
