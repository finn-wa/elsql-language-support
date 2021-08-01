import { CompletionProvider, CompletionProviderKey, ProvidedCompletionItem } from './completion';

interface IncludeCompletionItem extends ProvidedCompletionItem {
  data: { provider: 'INCLUDE' };
}

const includeCompletionProvider: CompletionProvider<IncludeCompletionItem> = {
  providerKey: 'INCLUDE',
  canProvideCompletions: (params) => false,
  provideCompletions: (params) => [],
  resolveCompletion: (selectedItem) => selectedItem,
};

export default includeCompletionProvider;
