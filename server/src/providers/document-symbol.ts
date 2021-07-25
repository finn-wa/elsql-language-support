import { DocumentSymbol, Position, SymbolKind } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { lineRange } from '../utils/position';

const NAME_PATTERN = /^@NAME\(([\w_]+)\)/gm;
const PREFIX_LENGTH = '@NAME('.length;

interface GroupMatchWithIndex extends RegExpMatchArray {
  length: 2;
  index: number;
}

/**
 * Document symbol provider.
 *
 * @param doc The document to find symbols in
 * @returns The document symbols
 */
export function provideDocumentSymbols(doc: TextDocument): DocumentSymbol[] {
  return Array.from(doc.getText().matchAll(NAME_PATTERN))
    .filter((m): m is GroupMatchWithIndex => m.index !== undefined && m.length === 2)
    .map((match) => {
      const tagStart = doc.positionAt(match.index);
      const paramStart = Position.create(tagStart.line, tagStart.character + PREFIX_LENGTH);
      return {
        name: match[1],
        range: lineRange(tagStart, match[0].length),
        selectionRange: lineRange(paramStart, match[1].length),
        kind: SymbolKind.Function,
      };
    });
}
