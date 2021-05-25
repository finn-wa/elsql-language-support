import { CompletionParams } from 'vscode-languageserver-protocol';
import { CompletionItem, CompletionItemKind, InsertTextFormat } from 'vscode-languageserver-types';
import { TagDoc, TagDocs } from '../resources/tags';

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

function completionItem(tag: TagDoc): CompletionItem {
  return {
    detail: tag.detail,
    documentation: tag.documentation,
    insertText: tag.label + buildParams(...tag.params),
    insertTextFormat: InsertTextFormat.Snippet,
    kind: CompletionItemKind.Keyword,
    label: tag.label,
  };
}

const completionItems = Object.values(TagDocs).map((c) => completionItem(c));

export const onCompletion = (_params: CompletionParams): CompletionItem[] => completionItems;
export const onCompletionResolve = (item: CompletionItem): CompletionItem => item;
