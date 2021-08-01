import { CompletionProviderKey, PROVIDERS } from './completion';

describe('CompletionProvider', () => {
  it('should have the correct provider for each key', () => {
    Object.keys(PROVIDERS).forEach((key) => {
      const provider = PROVIDERS[key as CompletionProviderKey];
      expect(provider).withContext('Registered CompletionProvider').toBeTruthy();
      expect(provider.providerKey).withContext('Provider key').toEqual(key);
    });
  });
});
