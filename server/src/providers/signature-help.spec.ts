import { SignatureHelp } from 'vscode-languageserver-types';
import { Params } from '../models/params';
import { TAG_DOCS } from '../models/tag-docs';
import { FileService } from '../services/files';
import { positionParams } from '../test/test-utils';
import { getSignatureHelp, provideSignatureHelp } from './signature-help';

describe('Signature Help Provider', () => {
  it('should extract relevant details from params', () => {
    const line = '    @NAME(';
    const getLineSpy = spyOn(FileService, 'getLine').and.returnValue(line);
    const params = positionParams(5, 9);
    const help = provideSignatureHelp(params);
    expect(help).withContext('Provided SignatureHelp').not.toBeNull();
    expect(getLineSpy).toHaveBeenCalledOnceWith(params);
    expect(help).toEqual(getSignatureHelp(line, 9));
  });

  it('should provide signature help for @NAME', () => {
    const line = '@NAME(';
    const help = getSignatureHelp(line, 6) as SignatureHelp;
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
    const help = getSignatureHelp(line, 25) as SignatureHelp;
    expect(help).withContext('Signature help').not.toBeNull();
    expect(help.signatures.length).withContext('Number of signatures').toBe(1);
    expect(help.activeParameter).withContext('Active param').toBe(1);
    const signature = help.signatures[0];
    expect(signature.parameters?.[1]).withContext('Second param').toEqual(Params.pageSize);
  });

  it('should not provide help if the cursor is not at the signature', () => {
    const line = '  @PAGING(:paging_offset,';
    const help = getSignatureHelp(line, 5) as SignatureHelp;
    expect(help).withContext('Signature help').toBeNull();
  });

  it('should provide help for all tags with params', () => {
    Object.values(TAG_DOCS)
      .filter((t) => t.params.length > 0)
      .forEach((tagDoc) => {
        const line = tagDoc.label + '(';
        const help = getSignatureHelp(line, line.length - 1) as SignatureHelp;
        expect(help)
          .withContext(tagDoc.label + ' signature help')
          .not.toBeNull();
        expect(help.signatures[0].label.startsWith(tagDoc.label))
          .withContext(tagDoc.label + 'signature label')
          .toBeTrue();
      });
  });
});
