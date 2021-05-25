import { MarkupContent, MarkupKind } from 'vscode-languageserver-types';

/**
 * Enum for runtime checking of TagNames
 */
enum Tag {
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
  params: string[];
  detail: string;
  documentation: MarkupContent;
}

interface Doc {
  explanation: string;
  example: string;
}

const docs: { [key in TagName]: Doc } = {
  INCLUDE: {
    explanation: `
The include tag includes the contents of a named block. If the parameter is a 
variable (prefixed by colon) then the name of the named block is looked up from 
the variable. The tag may be embedded in the middle of a line.`,
    example: `
@NAME(Cols)
    rowName, kind, val\n
@NAME(SearchByName)
    SELECT @INCLUDE(Cols)
    FROM foo
    WHERE rowName = :rowName`,
  },
  NAME: {
    explanation: `
The name tag creates a named block which can be referred to from the application
or another part of the elsql file. The tag must be on a line by itself. This is 
the only permitted tag at the top level.`,
    example: `
@NAME(SearchByName)
    SELECT *
    FROM foo
    WHERE name = :name`,
  },
  VALUE: {
    explanation: `
The value tag simply outputs the value of the variable. The tag may be embedded
in the middle of a line.`,
    example: `
@NAME(SearchByName)
		SELECT surname, forename
		FROM @VALUE(:table)
		WHERE name = :name`,
  },
  WHERE: {
    explanation: `
The where tag works together with the and/or tags to build dynamic searches. The
tag will output an SQL WHERE, but only if there is at least some content output 
from the block. Normally, the where tag is not needed, as there is typically 
always one active where clause. The where tag must be on a line by itself.`,
    example: `
@NAME(Search)
    SELECT * FROM foo
    @WHERE
        @AND(:name)
            name = :name
        @AND(:kind)
            kind = :kind`,
  },
  AND: {
    explanation: `
The block that the tag contains is only output if the expression is true. The 
output SQL will avoid outputting the AND if it immediately follows a WHERE. The 
tag must be on a line by itself.
    
The expression is evaluated as follows:
- If the variable does not exist, then the result is false.
- Otherwise, if the expression is \`(:foo)\` and \`foo\` is a boolean, then the result is the boolean value.
- Otherwise, if the expression is \`(:foo)\` and \`foo\` is not a boolean, then the result is true.
- Otherwise, if the expression is \`(:foo = bar)\` then the result is true if the variable equals "bar" ignoring case.`,
    example: `
@NAME(Search)
    SELECT * FROM foo
    WHERE 
        name = :name
        @AND(:kind)
            kind = :kind`,
  },
  OR: {
    explanation: `
The block that the tag contains is only output if the expression is true. The 
output SQL will avoid outputting the OR if it immediately follows a WHERE. The 
tag must be on a line by itself.
    
The expression is evaluated as follows:
- If the variable does not exist, then the result is false.
- Otherwise, if the expression is \`(:foo)\` and \`foo\` is a boolean, then the result is the boolean value.
- Otherwise, if the expression is \`(:foo)\` and \`foo\` is not a boolean, then the result is true.
- Otherwise, if the expression is \`(:foo = bar)\` then the result is true if the variable equals "bar" ignoring case.`,
    example: `
@NAME(Search)
    SELECT * FROM foo
    @WHERE
        name = :name
        @OR(:kind)
            kind = :kind`,
  },
  IF: {
    explanation: `
The block that the tag contains is only output if the expression is true. The 
tag must be on a line by itself.
    
The expression is evaluated as follows:
- If the variable does not exist, then the result is false.
- Otherwise, if the expression is \`(:foo)\` and \`foo\` is a boolean, then the result is the boolean value.
- Otherwise, if the expression is \`(:foo)\` and \`foo\` is not a boolean, then the result is true.
- Otherwise, if the expression is \`(:foo = bar)\` then the result is true if the variable equals "bar" ignoring case.`,
    example: `
@NAME(Search)
    SELECT * FROM foo
    @WHERE
        @AND(name = :name)
        @IF(:kindFilterEnabled)
            @AND(:kind)
                kind = :kind`,
  },
  LIKE: {
    explanation: `
The like tag adds either an SQL = or an SQL LIKE based on the specified 
variable. If the tag has no variable in brackets, then the text between the LIKE
tag and the end of the line is parsed for a variable. This tag can differ by 
database, so the actual SQL is generated by the configuration class.`,
    example: `
@NAME(Search)
    SELECT * FROM foo
    WHERE name @LIKE(:name)
    AND UPPER(type) @LIKE UPPER(:type)`,
  },
  ENDLIKE: {
    explanation: `
The end-like tag is used on rare occasions to scope the end of the like tag.
Normally, the SQL should be written such that the end of the like tag is the end
of the line`,
    example: `
@NAME(Search)
    SELECT * FROM foo
    WHERE UPPER(type) @LIKE UPPER(:type) @ENDLIKE AND name = :name`,
  },
  PAGING: {
    explanation: `
The paging tag adds the SQL code to page the results of a search. These can 
differ by database, so the actual SQL is generated by the configuration class. 
The tag bases its actions on the specified integer literals or variables which 
begin with a colon. This replaces the OFFSETFETCH/FETCH tags in most situations 
as it enables window functions to be used where necessary.`,
    example: `
@NAME(Search)
		@PAGING(:rowOffset, :pageSize)
    		SELECT * FROM foo
    		WHERE name = 'bar'
    		ORDER BY date`,
  },
  OFFSETFETCH: {
    explanation: `
The offset-fetch tag adds the SQL OFFSET and FETCH clauses for paging results.
These can differ by database, so the actual SQL is generated by the 
configuration class. The tag bases its actions on the specified literals or 
integer variables beginning with a colon. The names "paging_offset" and 
"paging_fetch" are used if the variables are not specified.

In most cases, it is best to use the @PAGING tag as it allows window functions
to be used where necessary.
    `,
    example: `
@NAME(Search)
    SELECT * FROM foo
    WHERE name = 'bar'
    ORDER BY date
    @OFFSETFETCH(:rowOffset,:pageSize)`,
  },
  FETCH: {
    explanation: `
The @FETCH tag adds the SQL FETCH clauses for limiting the number of results 
returned. This can differ by database, so the actual SQL is generated by the
configuration class. The tag bases its actions on the specified literals or 
integer variables beginning with a colon.`,
    example: `
@NAME(SearchVariableRowCount)
    SELECT * FROM foo
    WHERE name = 'bar'
    ORDER BY date
    @FETCH(:num_rows)`,
  },
  LOOP: {
    explanation: `
The \`@LOOP\` tag introduces the loop and has a single variable (or literal)
defining the loop size, such as \`@LOOP(:size)\`. Within the loop, use 
\`@LOOPINDEX\` to output a zero-based number matching the index around the loop.
At the end of the loop indented block, optionally provide an \`@LOOPJOIN\` 
followed by text to join each item in the loop. The \`@LOOPINDEX2\` and 
\`@LOOPINDEX3\` tags can be used for nested loops, although we do not recommend 
this level of complexity in elsql files.`,
    example: `
@NAME(Test1)
    SELECT * FROM foo WHERE
    @LOOP(:size)
        (a = :a@LOOPINDEX AND b = :b@LOOPINDEX)
        @LOOPJOIN OR
\`\`\`
could be used to output:

\`\`\`sql
SELECT * FROM foo WHERE (a = :a0 AND b = :b0) OR (a = :a1 AND b = :b1)`,
  },
  LOOPINDEX: {
    explanation: `
Example:`,
    example: `
@NAME(Test1)
    SELECT * FROM foo WHERE
    @LOOP(:size)
        (a = :a@LOOPINDEX AND b = :b@LOOPINDEX)
        @LOOPJOIN OR
\`\`\`
could be used to output:

\`\`\`sql
SELECT * FROM foo WHERE (a = :a0 AND b = :b0) OR (a = :a1 AND b = :b1)`,
  },
  LOOPINDEX2: {
    explanation: `
Output the second index within a nested @LOOP. Note that it is not advisable to
try produce complex loops in ElSQL.`,
    example: `-- GOOD LUCK`,
  },
  LOOPINDEX3: {
    explanation: `
Output the third index within a nested @LOOP. Note that it is not advisable to
try produce complex loops in ElSQL.`,
    example: `-- GOOD LUCK`,
  },
  LOOPJOIN: {
    explanation: `
Example:`,
    example: `
@NAME(Test1)
    SELECT * FROM foo WHERE
    @LOOP(:size)
        (a = :a@LOOPINDEX AND b = :b@LOOPINDEX)
        @LOOPJOIN OR
\`\`\`
could be used to output:

\`\`\`sql
SELECT * FROM foo WHERE (a = :a0 AND b = :b0) OR (a = :a1 AND b = :b1)`,
  },
};

function tagDoc(tag: TagName, detail: string, ...params: string[]): TagDoc {
  const doc = docs[tag];
  const title = `**@${tag}(${params.join(', ')})**\n`;
  const documentation = {
    kind: MarkupKind.Markdown,
    value: title + doc.explanation + '\n```sql\n' + doc.example + '\n```',
  };
  return { label: TagUtils.toValue(tag), params, detail, documentation };
}

export const TagDocs: { [key in TagName]: TagDoc } = {
  INCLUDE: tagDoc(Tag.INCLUDE, 'Include a named block', 'nameOrVariable'),
  NAME: tagDoc(Tag.NAME, 'Create a named block', 'name'),
  VALUE: tagDoc(Tag.VALUE, 'Output the value of a variable', 'variable'),
  WHERE: tagDoc(Tag.WHERE, 'Output a SQL WHERE if there are conditions in the block'),
  AND: tagDoc(Tag.AND, 'Output SQL AND if the the expression evaluates to true', 'expression'),
  OR: tagDoc(Tag.OR, 'Output SQL OR if the the expression evaluates to true', 'expression'),
  IF: tagDoc(
    Tag.IF,
    'Output the following block if the expression evaluates to true',
    'expression'
  ),
  LIKE: tagDoc(Tag.LIKE, 'Output a SQL LIKE if the variable evaluates to true', 'variable'),
  ENDLIKE: tagDoc(Tag.ENDLIKE, 'Scope the end of the @LIKE tag'),
  PAGING: tagDoc(
    Tag.PAGING,
    'Add the SQL code to page the results of a query',
    'rowOffset',
    'pageSize'
  ),
  OFFSETFETCH: tagDoc(
    Tag.OFFSETFETCH,
    'Add the SQL OFFSET and FETCH clauses for paging results',
    'rowOffset',
    'pageSize'
  ),
  FETCH: tagDoc(Tag.FETCH, 'Add the SQL FETCH clause (sometimes known as LIMIT)', 'pageSize'),
  LOOP: tagDoc(Tag.LOOP, 'Repeatedly output the following block', 'loopSize'),
  LOOPINDEX: tagDoc(Tag.LOOPINDEX, 'Output the index within a @LOOP'),
  LOOPINDEX2: tagDoc(Tag.LOOPINDEX2, 'Output the second index within a nested @LOOP'),
  LOOPINDEX3: tagDoc(Tag.LOOPINDEX3, 'Output the third index within a nested @LOOP'),
  LOOPJOIN: tagDoc(Tag.LOOPJOIN, 'Output text to join each item in a @LOOP'),
};
