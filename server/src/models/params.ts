import { MarkupKind, ParameterInformation } from 'vscode-languageserver-types';

export class Params {
  public static get expression(): ParameterInformation {
    return {
      label: 'expression: boolean',
      documentation: {
        kind: MarkupKind.Markdown,
        value: `
An expression which evaluates to true or false.
- If the variable does not exist, then the result is false.
- Otherwise, if the expression is \`(:foo)\` and \`foo\` is a boolean, then the 
result is the boolean value.
- Otherwise, if the expression is \`(:foo)\` and \`foo\` is not a boolean, then 
the result is true.
- Otherwise, if the expression is \`(:foo = bar)\` then the result is true if 
the variable equals "bar" ignoring case.`,
      },
    };
  }
  public static get blockName(): ParameterInformation {
    return {
      label: 'name: string',
      documentation: {
        kind: MarkupKind.Markdown,
        value: 'A name for the block. Used in the `@INCLUDE` tag to include this block elsewhere.',
      },
    };
  }
  public static get includeBlockName(): ParameterInformation {
    return {
      label: 'name: string',
      documentation: {
        kind: MarkupKind.Markdown,
        value: 'The name of the block to include. Can be a literal or a variable.',
      },
    };
  }
  public static get variable(): ParameterInformation {
    return {
      label: 'variable: any',
      documentation: {
        kind: MarkupKind.Markdown,
        value: 'The target `:variable`.',
      },
    };
  }
  public static get rowOffset(): ParameterInformation {
    return {
      label: 'rowOffset: number | string',
      documentation: {
        kind: MarkupKind.PlainText,
        value: 'The number of rows to offset the resultset by.',
      },
    };
  }
  public static get pageSize(): ParameterInformation {
    return {
      label: 'pageSize: number | string',
      documentation: {
        kind: MarkupKind.PlainText,
        value: 'The max number of results to return.',
      },
    };
  }
  public static get loopSize(): ParameterInformation {
    return {
      label: 'loopSize: number | string',
      documentation: {
        kind: MarkupKind.PlainText,
        value: 'The number of iterations to run the loop. Can be a literal or a variable.',
      },
    };
  }
}
