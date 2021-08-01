import {
  Command,
  CompletionItemKind,
  InsertTextFormat,
  ParameterInformation,
} from 'vscode-languageserver-types';
import { TagValue } from '../../models/tag';
import { TagDoc, TAG_DOCS } from '../../models/tag-docs';
import { CompletionProvider, ProvidedCompletionItem } from './completion';

const TRIGGER_PARAM_HINTS = Command.create(
  'Trigger Parameter Hints',
  'editor.action.triggerParameterHints'
);

/**
 * Custom CompletionItem used by this provider.
 */
export interface TagCompletionItem extends ProvidedCompletionItem {
  label: TagValue;
  detail: string;
  kind: typeof CompletionItemKind.Keyword;
  data: { provider: 'TAG' };
}

/**
 * Converts a TagDoc into the initial minimal TagCompletionItem to be displayed
 * in a list.
 *
 * @param tag The TagDoc
 * @returns The initial CompletionItem
 */
function initialCompletion(tag: TagDoc): TagCompletionItem {
  return {
    label: tag.label,
    detail: tag.detail,
    kind: CompletionItemKind.Keyword,
    data: { provider: 'TAG' },
  };
}

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
 * Converts a TagDoc into a CompletionItem with full documentation.
 *
 * @param doc TagDoc
 * @returns CompletionItem for the tag doc
 */
function completionItem(doc: TagDoc): TagCompletionItem {
  return {
    ...initialCompletion(doc),
    documentation: doc.documentation,
    insertText: doc.label + buildParams(doc.params),
    insertTextFormat: InsertTextFormat.Snippet,
    command: TRIGGER_PARAM_HINTS,
  };
}

const initialCompletions = Object.values(TAG_DOCS).map((doc) => initialCompletion(doc));
const resolvedCompletions = new Map<TagValue, TagCompletionItem>(
  Object.values(TAG_DOCS).map((doc) => [doc.label, completionItem(doc)])
);

const tagCompletionProvider: CompletionProvider<TagCompletionItem> = {
  providerKey: 'TAG',
  canProvideCompletions: (params) => true,
  provideCompletions: (params) => initialCompletions,
  resolveCompletion: (selectedItem: TagCompletionItem) =>
    resolvedCompletions.get(selectedItem.label) as TagCompletionItem,
};

export default tagCompletionProvider;
