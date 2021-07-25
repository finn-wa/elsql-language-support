import { SignatureHelp } from 'vscode-languageserver-types';
import { Params } from '../models/params';
import { TagDoc, TAG_DOCS } from '../models/tags';
import { positionParams } from '../test/test-utils';
import { provideSignatureHelp } from './signature-help';

describe('Signature Help Provider', () => {
  it('should provide signature help for @NAME', () => {
    const line = '@NAME(';
    const help = provideSignatureHelp(positionParams(0, 6), line) as SignatureHelp;
    expect(help).withContext('Signature help').not.toBeNull();
    expect(help.signatures.length).withContext('Num signatures').toBe(1);
    expect(help.activeParameter).withContext('Active param').toBe(0);
    expect(help.activeSignature).withContext('Active signature').toBe(0);
    const signature = help.signatures[0];
    expect(signature.label).withContext('Signature label').toEqual('@NAME(name: str)');
    expect(signature.documentation).withContext('Signature docs').toEqual(TAG_DOCS.NAME.detail);
    expect(signature.parameters?.length).withContext('Num params').toBe(1);
    expect(signature.parameters?.[0]).withContext('Parameter').toEqual(Params.includeBlockName);
  });

  it('should provide help for second param', () => {
    const line = '  @PAGING(:paging_offset,';
    const help = provideSignatureHelp(positionParams(0, 25), line) as SignatureHelp;
    expect(help).withContext('Signature help').not.toBeNull();
    expect(help.signatures.length).withContext('Number of signatures').toBe(1);
    expect(help.activeParameter).withContext('Active param').toBe(1);
    const signature = help.signatures[0];
    expect(signature.parameters?.[1]).withContext('Second param').toEqual(Params.pageSize);
  });

  it('should not provide help if the cursor is not at the signature', () => {
    const line = '  @PAGING(:paging_offset,';
    const help = provideSignatureHelp(positionParams(5, 5), line) as SignatureHelp;
    expect(help).withContext('Signature help').toBeNull();
  });

  it('should provide help for all tags with params', () => {
    Object.values(TAG_DOCS)
      .filter((t) => t.params.length > 0)
      .forEach((tagDoc: TagDoc) => {
        const line = tagDoc.label + '(';
        const posParams = positionParams(5, line.length - 1);
        const help = provideSignatureHelp(posParams, line) as SignatureHelp;
        expect(help)
          .withContext(tagDoc.label + ' signature help')
          .not.toBeNull();
        expect(help.signatures[0].label.startsWith(tagDoc.label))
          .withContext(tagDoc.label + 'signature label')
          .toBeTrue();
      });
  });
});
