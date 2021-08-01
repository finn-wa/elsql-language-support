import {
  RenameParams,
  ResponseError,
  TextEdit,
  WorkspaceEdit,
} from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { FileService } from '../services/files';
import { lineRange } from '../utils/position';
import * as RegexUtils from '../utils/regex';

const VAR_PREFIX = /(?<=:)/.source;
const FUNC_PREFIX = /(?<=@NAME\(|@INCLUDE\()/.source;
const FUNC_SUFFIX = /(?=\))/.source;
const VALID_CHAR = /\w/.source;

const VAR_PATTERN = new RegExp(`${VAR_PREFIX}${VALID_CHAR}+`, 'gm');
const FUNC_PATTERN = new RegExp(`${FUNC_PREFIX}${VALID_CHAR}+${FUNC_SUFFIX}`, 'gm');
const INVALID_PATTERN = new RegExp(`[^${VALID_CHAR}]`, 'gm');

/**
 * Generates TextEdits which replace all matches with the newName string.
 *
 * @param doc The doc to search for matches in
 * @param regex The regular expression to use to find matches
 * @param newName The replacement value
 * @returns A WorkspaceEdit containing the edits
 */
function replaceMatches(doc: TextDocument, regex: RegExp, newName: string): WorkspaceEdit {
  const text = doc.getText();
  const replacements = Array.from(text.matchAll(regex))
    .filter(RegexUtils.isMatchWithIndex)
    .map((match) => {
      const startPos = doc.positionAt(match.index);
      return TextEdit.replace(lineRange(startPos, match[0].length), newName);
    });
  const changes: { [uri: string]: TextEdit[] } = {};
  changes[doc.uri] = replacements;
  return { changes };
}

/**
 * Validates the new name value. Throws an error if it is invalid.
 *
 * @param newName The value to check
 */
function validateNewName(newName: string): void {
  if (newName.length === 0) {
    throw new ResponseError(400, 'Provide a new name.');
  }
  const invalidChars = Array.from(newName.matchAll(INVALID_PATTERN)).map((m) => m[0]);
  if (invalidChars.length > 0) {
    const msg = `New name can only contain letters, numbers, and underscores. Invalid chars: "${invalidChars.join()}"`;
    throw new ResponseError(400, msg);
  }
}

/**
 * Rename provider
 *
 * @param params Rename params
 * @param doc The text document referenced by the params
 * @returns WorkspaceEdit or null if not a valid rename
 */
export function provideRename(params: RenameParams): WorkspaceEdit | null {
  const newName = params.newName.trim();
  validateNewName(newName);
  const doc = FileService.getDocument(params);
  const line = doc.getText(FileService.getLineRange(params));
  const varMatch = RegexUtils.findMatchAtPosition(line, VAR_PATTERN, params.position);
  if (varMatch !== null) {
    const oldNamePattern = new RegExp(VAR_PREFIX + varMatch[0], 'gm');
    return replaceMatches(doc, oldNamePattern, newName);
  }
  const funcMatch = RegexUtils.findMatchAtPosition(line, FUNC_PATTERN, params.position);
  if (funcMatch !== null) {
    const oldNamePattern = new RegExp(FUNC_PREFIX + funcMatch[0] + FUNC_SUFFIX, 'gm');
    return replaceMatches(doc, oldNamePattern, newName);
  }
  return null;
}
