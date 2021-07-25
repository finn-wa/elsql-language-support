import { Hover, Position } from 'vscode-languageserver';
import { Tag, TagName, TAG_DOCS } from '../models/tags';
import { positionParams, rangeFromPosition } from '../test/test-utils';
import { provideHover } from './hover';

/**
 * Returns the hover text for the specified tag.
 *
 * @param tag
 * @returns
 */
function hoverTextForTag(tag: TagName) {
  return TAG_DOCS[tag].detail;
}

describe('HoverProvider', () => {
  it('should provide hover details for @NAME', () => {
    const line = '@NAME(Search) -- search';
    const hover = provideHover(positionParams(0, 4), line) as Hover;
    expect(hover).not.toBeNull();
    expect(hover.contents).toEqual(hoverTextForTag('NAME'));
  });

  it('should provide a hover range for @NAME', () => {
    const line = '@NAME(Search) -- search';
    const hover = provideHover(positionParams(12, 4), line) as Hover;
    expect(hover).not.toBeNull();
    expect(hover.range).toEqual(rangeFromPosition(Position.create(12, 0), 5));
  });

  it('should provide a hover at any point in the tag', () => {
    const line = '@NAME(Search) -- search';
    const hover = provideHover(positionParams(0, 0), line) as Hover;
    expect(hover).not.toBeNull();
    expect(hover.contents).toEqual(hoverTextForTag('NAME'));
    expect(hover.range).toEqual(rangeFromPosition(Position.create(0, 0), 5));
  });

  it('should not provide a hover for the tag params', () => {
    const line = '@NAME(Search) -- search';
    expect(provideHover(positionParams(0, 5), line)).toBeNull();
  });

  it('should handle multiple tags per line', () => {
    const line = '  UPPER(name) @LIKE UPPER(:name) @INCLUDE(NameMatcher)';

    const likeHover = provideHover(positionParams(2, 14), line) as Hover;
    expect(likeHover.contents).toEqual(hoverTextForTag('LIKE'));
    expect(likeHover.range).toEqual(rangeFromPosition(Position.create(2, 14), 5));

    const includeHover = provideHover(positionParams(2, 37), line) as Hover;
    expect(includeHover.contents).toEqual(hoverTextForTag('INCLUDE'));
    expect(includeHover.range).toEqual(rangeFromPosition(Position.create(2, 33), 8));
  });

  it('should not provide a hover when there are no tags', () => {
    const line = 'AND from_instant <= :to_instant AND to_instant > :to_instant';
    expect(provideHover(positionParams(0, 5), line)).toBeNull();
  });

  it('should not provide a hover when there are no valid tags', () => {
    const line = '@INCLUDES';
    expect(provideHover(positionParams(0, 5), line)).toBeNull();
  });

  it('should provide a hover for every tag', () => {
    Object.keys(Tag).forEach((tag) => {
      const hover = provideHover(positionParams(0, 0), '@' + tag) as Hover;
      expect(hover).not.toBeNull();
      expect(hover.contents).toEqual(hoverTextForTag(tag as TagName));
    });
  });
});
