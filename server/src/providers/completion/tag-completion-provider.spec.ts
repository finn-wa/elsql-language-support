import { CompletionParams } from 'vscode-languageserver';
import { positionParams } from '../../test/test-utils';
import TagCompletions, { TagCompletionItem } from './tag-completion-provider';

describe('Tag Completion Provider', () => {
  it('should have the correct provider key', () => {
    expect(TagCompletions.providerKey).toEqual('TAG');
  });

  it('should provide initial completions', () => {
    const completions = TagCompletions.provideCompletions({} as CompletionParams);
    expect(completions.length).toBeGreaterThan(16);
    completions.forEach((completion) => {
      expect(completion.label.length).toBeGreaterThan(0);
      expect(completion.detail).toBeTruthy();
      expect(completion.data.provider).toEqual('TAG');
      expect(completion.insertText).toBeUndefined();
      expect(completion.documentation).toBeUndefined();
    });
  });

  it('should resolve a completion', () => {
    const resolved = TagCompletions.resolveCompletion({
      label: '@AND',
    } as TagCompletionItem) as TagCompletionItem;
    expect(resolved.label).toEqual('@AND');
    expect(resolved.data.provider).toEqual('TAG');
    expect(resolved.insertText).toBeTruthy();
    expect(resolved.documentation).toBeTruthy();
  });
});
