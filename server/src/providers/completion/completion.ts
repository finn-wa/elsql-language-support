import TagCompletionProvider from './tag-completion-provider';
import IncludeCompletionProvider from './include-completion-provider';
import { CompletionItem, CompletionParams, ResponseError } from 'vscode-languageserver';

/**
 * Union type containing each completion provider key. The key is used to
 * identify the provider for the resolveCompletion callback.
 */
export type CompletionProviderKey = 'TAG' | 'INCLUDE';

/**
 * Interface which ensures each provider identifies their completions.
 */
export interface ProvidedCompletionItem extends CompletionItem {
  data: {
    provider: CompletionProviderKey;
    [x: string]: any;
  };
}

/**
 * Interface to be implemented by completion providers.
 */
export interface CompletionProvider<T extends ProvidedCompletionItem> {
  providerKey: CompletionProviderKey;
  canProvideCompletions: (params: CompletionParams) => boolean;
  provideCompletions: (params: CompletionParams) => T[];
  resolveCompletion: (selectedItem: T) => T | ResponseError<void>;
}

/**
 * Contains the provider for each CompletionProviderKey.
 */
export const PROVIDERS: { [K in CompletionProviderKey]: CompletionProvider<any> } = {
  INCLUDE: IncludeCompletionProvider,
  TAG: TagCompletionProvider,
};

/**
 * Provides all applicable completions from all providers.
 *
 * @param params The CompletionParams
 * @returns A list of completions
 */
export function provideCompletion(params: CompletionParams): CompletionItem[] {
  return Object.values(PROVIDERS)
    .filter((p) => p.canProvideCompletions(params))
    .flatMap((p) => p.provideCompletions(params) as CompletionItem[]);
}

/**
 * Resolves a completion, adding more details to the documentation.
 *
 * @param item The selected completion item
 * @returns The resolved completion
 */
export function resolveCompletion(item: CompletionItem): CompletionItem | ResponseError<void> {
  let selectedItem = item as ProvidedCompletionItem;
  return PROVIDERS[selectedItem.data.provider].resolveCompletion(selectedItem);
}
