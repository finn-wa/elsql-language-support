import { TagName } from '../tag';

export type DocsType = { readonly [key in TagName]: string };

export const Docs: DocsType = {
  AND: require('./AND.md'),
  ENDLIKE: require('./ENDLIKE.md'),
  FETCH: require('./FETCH.md'),
  IF: require('./IF.md'),
  INCLUDE: require('./INCLUDE.md'),
  LIKE: require('./LIKE.md'),
  LOOP: require('./LOOP.md'),
  LOOPINDEX: require('./LOOPINDEX.md'),
  LOOPINDEX2: require('./LOOPINDEX2.md'),
  LOOPINDEX3: require('./LOOPINDEX3.md'),
  LOOPJOIN: require('./LOOPJOIN.md'),
  NAME: require('./NAME.md'),
  OFFSETFETCH: require('./OFFSETFETCH.md'),
  OR: require('./OR.md'),
  PAGING: require('./PAGING.md'),
  VALUE: require('./VALUE.md'),
  WHERE: require('./WHERE.md'),
};
