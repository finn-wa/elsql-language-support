import { CompletionItem, CompletionItemKind, InsertTextFormat, MarkupKind } from 'vscode-languageserver-types';

interface DocumentedCompletion {
  label: string;
  params: string[];
  detail: string;
  explanation: string;
  example: string;
}

const completions: Record<string, DocumentedCompletion> = {
  include: {
    label: '@INCLUDE',
    params: ['nameOrVariable'],
    detail: 'Include a named block',
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
  name: {
    label: '@NAME',
    params: ['name'],
    detail: 'Create a named block',
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
  value: {
    label: '@VALUE',
    params: ['variable'],
    detail: 'Output the value of a variable',
    explanation: `
The value tag simply outputs the value of the variable. The tag may be embedded
in the middle of a line.`,
    example: `
@NAME(SearchByName)
		SELECT surname, forename
		FROM @VALUE(:table)
		WHERE name = :name`,
  },
  where: {
    label: '@WHERE',
    params: [],
    detail: 'Output a SQL WHERE if there are conditions in the block',
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
  and: {
    label: '@AND',
    params: ['expression'],
    detail: 'Output SQL AND if the the expression evaluates to true',
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
  or: {
    label: '@OR',
    params: ['expression'],
    detail: 'Output SQL OR if the the expression evaluates to true',
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
  if: {
    label: '@IF',
    params: ['expression'],
    detail: 'Output the following block if the expression evaluates to true',
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
  like: {
    label: '@LIKE',
    params: ['variable'],
    detail: 'Output a SQL LIKE if the variable evaluates to true',
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
  endLike: {
    label: '@ENDLIKE',
    params: [],
    detail: 'Scope the end of the @LIKE tag',
    explanation: `
The end-like tag is used on rare occasions to scope the end of the like tag.
Normally, the SQL should be written such that the end of the like tag is the end
of the line`,
    example: `
@NAME(Search)
    SELECT * FROM foo
    WHERE UPPER(type) @LIKE UPPER(:type) @ENDLIKE AND name = :name`,
  },
  paging: {
    label: '@PAGING',
    params: ['rowOffset', 'pageSize'],
    detail: 'Add the SQL code to page the results of a query',
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
  offsetFetch: {
    label: '@OFFSETFETCH',
    params: ['rowOffset', 'pageSize'],
    detail: 'Add the SQL OFFSET and FETCH clauses for paging results',
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
  fetch: {
    label: '@FETCH',
    params: ['pageSize'],
    detail: 'Add the SQL FETCH clause (sometimes known as LIMIT)',
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
  loop: {
    label: '@LOOP',
    params: ['loopSize'],
    detail: 'Repeatedly output the following block',
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
  loopIndex: {
    label: '@LOOPINDEX',
    params: [],
    detail: 'Output the index within a @LOOP',
    explanation: '\nExample:',
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
  loopIndex2: {
    label: '@LOOPINDEX2',
    params: [],
    detail: 'Output the second index within a nested @LOOP',
    explanation: `
Output the second index within a nested @LOOP. Note that it is not advisable to
try produce complex loops in ElSQL.`,
    example: `-- GOOD LUCK`,
  },
  loopIndex3: {
    label: '@LOOPINDEX3',
    params: [],
    detail: 'Output the third index within a nested @LOOP',
    explanation: `
Output the third index within a nested @LOOP. Note that it is not advisable to
try produce complex loops in ElSQL.`,
    example: `-- GOOD LUCK`,
  },
  loopJoin: {
    label: '@LOOPJOIN',
    params: [],
    detail: 'Output text to join each item in a @LOOP',
    explanation: '\nExample:',
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

function buildParams(...params: string[]): string {
  if (params.length === 0) {
    return ''; // Keywords don't get any brackets if they don't have params
  }
  return params.reduce((acc, param, index) => {
    const i = index + 1;
    const suffix = i === params.length ? ')' : ',';
    return acc + '${' + i + ':' + param + '}' + suffix;
  }, '(');
}

function documentation(doc: DocumentedCompletion): string {
  const title = `**${doc.label}(${doc.params.join(', ')})**\n`;
  return title + doc.explanation + '\n```sql\n' + doc.example + '\n```';
}

function completionItem(doc: DocumentedCompletion): CompletionItem {
  return {
    label: doc.label,
    detail: doc.detail,
    kind: CompletionItemKind.Keyword,
    insertTextFormat: InsertTextFormat.Snippet,
    insertText: doc.label + buildParams(...doc.params),
    documentation: {
      kind: MarkupKind.Markdown,
      value: documentation(doc),
    },
  };
}

const completionItems = Object.values(completions).map((c) => completionItem(c));

export function functionCompletions(): CompletionItem[] {
  return completionItems;
}
