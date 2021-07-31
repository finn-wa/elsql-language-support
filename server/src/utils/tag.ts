import { Tag, TagName, TagValue } from '../models/tag';

/**
 * Regex which matches a potential tag (@ followed by capital letters,
 * optionally ending with 2 or 3 for LOOPINDEX tags)
 */
export const TAG_PATTERN = new RegExp(/@[A-Z]+[23]?/g);

/**
 * Type assertion for a TagName (tag without @)
 *
 * @param str String to check
 * @returns true if the string is a TagName
 */
export function isName(str: string): str is TagName {
  return str in Tag;
}

/**
 * Type assertion for a TagValue (tag with @)
 *
 * @param str String to check
 * @returns true if the string is a TagValue
 */
export function isValue(str: string): str is TagValue {
  return str.startsWith('@') && str.slice(1) in Tag;
}

/**
 * Converts a TagValue to a TagName by removing the @ prefix
 *
 * @param value TagValue
 * @returns TagName
 */
export function toName(value: TagValue): TagName {
  return value.slice(1) as TagName;
}

/**
 * Converts a TagName to a TagValue by adding the @ prefix
 *
 * @param name TagName
 * @returns TagValue
 */
export function toValue(name: TagName): TagValue {
  return `@${name}` as TagValue;
}
