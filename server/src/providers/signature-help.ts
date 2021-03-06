import {
  ParameterInformation,
  SignatureHelp,
  SignatureHelpParams,
  SignatureInformation,
} from 'vscode-languageserver-protocol';
import { TagDoc, TAG_DOCS } from '../models/tag-docs';
import { FileService } from '../services/files';
import { TAG_PATTERN } from '../utils/tag';

/**
 * Converts a TagDoc into a SignatureItem
 *
 * @param tag TagDoc
 * @returns SignatureItem
 */
function signatureItem(tag: TagDoc) {
  return {
    label: `${tag.label}(${tag.params.map((p) => p.label).join(', ')})`,
    documentation: tag.detail,
    parameters: tag.params,
  };
}

const signatures = new Map<string, SignatureInformation>(
  Object.values(TAG_DOCS)
    .filter((t: TagDoc) => t.params.length > 0)
    .map((tag: TagDoc) => {
      return [tag.label, signatureItem(tag)];
    })
);

/**
 * Get the active parameter's index
 *
 * @param text The text between the open bracket and the cursor
 * @param params The parameters for the active signature
 * @returns The index of the active parameter
 */
function getActiveParam(text: string, params?: ParameterInformation[]): number | null {
  if (params) {
    return Math.min(Array.from(text.matchAll(/,/g)).length, params.length - 1);
  }
  return null;
}

/**
 * Gets signature help.
 *
 * @param line Contents of the line that the cursor is on
 * @param charPos Position of the cursor in the line
 * @returns SignatureHelp (or null if none found)
 */
export function getSignatureHelp(line: string, charPos: number) {
  const beforeCursor = line.slice(0, charPos);
  const tagMatches = Array.from(beforeCursor.matchAll(TAG_PATTERN));
  if (tagMatches.length === 0) {
    return null;
  }
  // Find tag closest to the cursor
  const tagMatch = tagMatches[tagMatches.length - 1];
  const sig = signatures.get(tagMatch[0]);
  if (sig === undefined) {
    return null;
  }
  const afterTrigger = line.slice((tagMatch.index || 0) + tagMatch[0].length, charPos);
  // If tag has been closed, don't suggest anything
  if (afterTrigger.includes(')')) {
    return null;
  }
  return {
    signatures: [sig],
    activeParameter: getActiveParam(afterTrigger, sig.parameters),
    activeSignature: 0,
  };
}

/**
 * Signature help handler
 *
 * @param params SignatureHelpParams
 * @returns SignatureHelp (or null if none found)
 */
export function provideSignatureHelp(params: SignatureHelpParams): SignatureHelp | null {
  return getSignatureHelp(FileService.getLine(params), params.position.character);
}
