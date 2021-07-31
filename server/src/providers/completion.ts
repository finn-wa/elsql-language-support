import { CompletionParams } from 'vscode-languageserver-protocol';
import {
  Command,
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  ParameterInformation,
} from 'vscode-languageserver-types';
import { TagDoc, TAG_DOCS } from '../models/tag-docs';

const TRIGGER_PARAM_HINTS = Command.create(
  'Trigger Parameter Hints',
  'editor.action.triggerParameterHints'
);

/**
 * Builds a snippet for inserting tag parameters
 *
 * @param params Tag parameters
 * @returns Snippet
 */
function buildParams(params: ParameterInformation[]): string {
  if (params.length === 0) {
    return ''; // Keywords don't get any brackets if they don't have params
  }
  return params.reduce((acc, param, index) => {
    const i = index + 1;
    const suffix = i === params.length ? ')' : ',';
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    return acc + '${' + i + ':' + param.label + '}' + suffix;
  }, '(');
}

/**
 * Converts a TagDoc into a completion item
 *
 * @param tag TagDoc
 * @returns CompletionItem for the tag doc
 */
function completionItem(tag: TagDoc): CompletionItem {
  return {
    detail: tag.detail,
    documentation: tag.documentation,
    insertText: tag.label + buildParams(tag.params),
    insertTextFormat: InsertTextFormat.Snippet,
    kind: CompletionItemKind.Keyword,
    label: tag.label,
    command: TRIGGER_PARAM_HINTS,
  };
}

const completionItems = Object.values(TAG_DOCS).map((c) => completionItem(c));

/**
 * Completion handler
 * @param _params Completion params
 * @returns A list of CompletionItems
 */
export const provideCompletion = (_params: CompletionParams): CompletionItem[] => completionItems;
