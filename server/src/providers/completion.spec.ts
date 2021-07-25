import { CompletionParams } from 'vscode-languageserver';
import { provideCompletion } from './completion';

describe('Completion Provider', () => {
  it('should provide completions', () => {
    const completions = provideCompletion({} as CompletionParams);
    expect(completions.length).toBeGreaterThan(16);
    completions.forEach((completion) => {
      expect(completion.label.length).toBeGreaterThan(0);
      expect(completion.detail).toBeTruthy();
      expect(completion.insertText).toBeTruthy();
      expect(completion.documentation).toBeTruthy();
      expect(completion.command?.command).toEqual('editor.action.triggerParameterHints');
    });
  });
});
