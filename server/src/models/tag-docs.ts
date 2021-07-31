import { MarkupContent, MarkupKind, ParameterInformation } from 'vscode-languageserver-types';
import * as TagUtils from '../utils/tag';
import { Docs } from './docs';
import { Params } from './params';
import { Tag, TagName, TagValue } from './tag';

export class TagDoc {
  readonly label: TagValue;
  readonly documentation: MarkupContent;
  readonly detail: string;
  readonly params: ParameterInformation[];

  constructor(tag: TagName, detail: string, ...params: ParameterInformation[]) {
    this.label = TagUtils.toValue(tag);
    this.detail = detail;
    this.params = params;
    const title = `**${this.label}(${params.map((p) => p.label).join(', ')})**\n\n`;
    this.documentation = {
      kind: MarkupKind.Markdown,
      value: title + Docs[tag],
    };
  }
}

export type TagDocsType = { readonly [key in TagName]: TagDoc };

export const TAG_DOCS: TagDocsType = {
  INCLUDE: new TagDoc(Tag.INCLUDE, 'Include a named block', Params.blockName),
  NAME: new TagDoc(Tag.NAME, 'Create a named block', Params.includeBlockName),
  VALUE: new TagDoc(Tag.VALUE, 'Output the value of a variable', Params.variable),
  WHERE: new TagDoc(Tag.WHERE, 'Output a SQL WHERE if there are conditions in the block'),
  AND: new TagDoc(
    Tag.AND,
    'Output SQL AND if the the expression evaluates to true',
    Params.expression
  ),
  OR: new TagDoc(
    Tag.OR,
    'Output SQL OR if the the expression evaluates to true',
    Params.expression
  ),
  IF: new TagDoc(
    Tag.IF,
    'Output the following block if the expression evaluates to true',
    Params.expression
  ),
  LIKE: new TagDoc(
    Tag.LIKE,
    'Output a SQL LIKE if the variable evaluates to true',
    Params.variable
  ),
  ENDLIKE: new TagDoc(Tag.ENDLIKE, 'Scope the end of the @LIKE tag'),
  PAGING: new TagDoc(
    Tag.PAGING,
    'Add the SQL code to page the results of a query',
    Params.rowOffset,
    Params.pageSize
  ),
  OFFSETFETCH: new TagDoc(
    Tag.OFFSETFETCH,
    'Add the SQL OFFSET and FETCH clauses for paging results',
    Params.rowOffset,
    Params.pageSize
  ),
  FETCH: new TagDoc(
    Tag.FETCH,
    'Add the SQL FETCH clause (sometimes known as LIMIT)',
    Params.pageSize
  ),
  LOOP: new TagDoc(Tag.LOOP, 'Repeatedly output the following block', Params.loopSize),
  LOOPINDEX: new TagDoc(Tag.LOOPINDEX, 'Output the index within a @LOOP'),
  LOOPINDEX2: new TagDoc(Tag.LOOPINDEX2, 'Output the second index within a nested @LOOP'),
  LOOPINDEX3: new TagDoc(Tag.LOOPINDEX3, 'Output the third index within a nested @LOOP'),
  LOOPJOIN: new TagDoc(Tag.LOOPJOIN, 'Output text to join each item in a @LOOP'),
};
