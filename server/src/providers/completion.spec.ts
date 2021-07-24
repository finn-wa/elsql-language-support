import { CompletionParams } from 'vscode-languageserver';
import { provideCompletion } from './completion';

describe('Completion Provider', () => {
  it('should provide completions', () => {
    const completions = provideCompletion({} as CompletionParams);
    expect(completions.length).toBeGreaterThan(16);
  });
});
