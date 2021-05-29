import { DocumentSymbol, Position, Range, SymbolKind } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';

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
      const pos = doc.positionAt(match.index);
      return {
        name: match[1],
        range: Range.create(pos, Position.create(pos.line, pos.character + match[0].length)),
        selectionRange: Range.create(
          Position.create(pos.line, pos.character + PREFIX_LENGTH),
          Position.create(pos.line, pos.character + PREFIX_LENGTH + match[1].length)
        ),
        kind: SymbolKind.Function,
      };
    });
}
