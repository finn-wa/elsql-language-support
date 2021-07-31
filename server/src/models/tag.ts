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
