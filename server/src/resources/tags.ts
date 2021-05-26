import { MarkupContent, MarkupKind, ParameterInformation } from 'vscode-languageserver-types';
import { DOCS } from './docs';
import { Params } from './params';

/**
 * Enum for runtime checking of TagNames
 */
export enum Tag {
  INCLUDE = 'INCLUDE',
  NAME = 'NAME',
  VALUE = 'VALUE',
  WHERE = 'WHERE',
  AND = 'AND',
  OR = 'OR',
  IF = 'IF',
  LIKE = 'LIKE',
  ENDLIKE = 'ENDLIKE',
  PAGING = 'PAGING',
  OFFSETFETCH = 'OFFSETFETCH',
  FETCH = 'FETCH',
  LOOP = 'LOOP',
  LOOPINDEX = 'LOOPINDEX',
  LOOPINDEX2 = 'LOOPINDEX2',
  LOOPINDEX3 = 'LOOPINDEX3',
  LOOPJOIN = 'LOOPJOIN',
}
export type TagName = keyof typeof Tag;
export type TagValue = `@${TagName}`;

export namespace TagUtils {
  export function isName(str: string): str is TagName {
    return str in Tag;
  }
  export function isValue(str: string): str is TagValue {
    return str.startsWith('@') && str.slice(1) in Tag;
  }
  export function toName(value: TagValue): TagName {
    return value.slice(1) as TagName;
  }
  export function toValue(name: TagName): TagValue {
    return `@${name}` as TagValue;
  }
}

export interface TagDoc {
  label: TagValue;
  params: ParameterInformation[];
  detail: string;
  documentation: MarkupContent;
}

function tagDoc(tag: TagName, detail: string, ...params: ParameterInformation[]): TagDoc {
  // const parameters =
  const doc = DOCS[tag];
  const title = `**@${tag}(${params.map((p) => p.label).join(', ')})**\n`;
  const documentation = {
    kind: MarkupKind.Markdown,
    value: title + doc.explanation + '\n```sql\n' + doc.example + '\n```',
  };
  return { label: TagUtils.toValue(tag), params, detail, documentation };
}

export type TagDocsType = { [key in TagName]: TagDoc };
export class TagDocs implements TagDocsType {
  readonly INCLUDE = tagDoc(Tag.INCLUDE, 'Include a named block', Params.blockName);
  readonly NAME = tagDoc(Tag.NAME, 'Create a named block', Params.includeBlockName);
  readonly VALUE = tagDoc(Tag.VALUE, 'Output the value of a variable', Params.variable);
  readonly WHERE = tagDoc(Tag.WHERE, 'Output a SQL WHERE if there are conditions in the block');
  readonly AND = tagDoc(
    Tag.AND,
    'Output SQL AND if the the expression evaluates to true',
    Params.expression
  );
  readonly OR = tagDoc(
    Tag.OR,
    'Output SQL OR if the the expression evaluates to true',
    Params.expression
  );
  readonly IF = tagDoc(
    Tag.IF,
    'Output the following block if the expression evaluates to true',
    Params.expression
  );
  readonly LIKE = tagDoc(
    Tag.LIKE,
    'Output a SQL LIKE if the variable evaluates to true',
    Params.variable
  );
  readonly ENDLIKE = tagDoc(Tag.ENDLIKE, 'Scope the end of the @LIKE tag');
  readonly PAGING = tagDoc(
    Tag.PAGING,
    'Add the SQL code to page the results of a query',
    Params.rowOffset,
    Params.pageSize
  );
  readonly OFFSETFETCH = tagDoc(
    Tag.OFFSETFETCH,
    'Add the SQL OFFSET and FETCH clauses for paging results',
    Params.rowOffset,
    Params.pageSize
  );
  readonly FETCH = tagDoc(
    Tag.FETCH,
    'Add the SQL FETCH clause (sometimes known as LIMIT)',
    Params.pageSize
  );
  readonly LOOP = tagDoc(Tag.LOOP, 'Repeatedly output the following block', Params.loopSize);
  readonly LOOPINDEX = tagDoc(Tag.LOOPINDEX, 'Output the index within a @LOOP');
  readonly LOOPINDEX2 = tagDoc(Tag.LOOPINDEX2, 'Output the second index within a nested @LOOP');
  readonly LOOPINDEX3 = tagDoc(Tag.LOOPINDEX3, 'Output the third index within a nested @LOOP');
  readonly LOOPJOIN = tagDoc(Tag.LOOPJOIN, 'Output text to join each item in a @LOOP');
}

export const TAG_DOCS = new TagDocs();
