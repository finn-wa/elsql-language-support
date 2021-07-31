import { Hover, Position } from 'vscode-languageserver';
import { Tag, TagName } from '../models/tag';
import { TAG_DOCS } from '../models/tag-docs';
import { positionParams } from '../test/test-utils';
import { lineRange } from '../utils/position';
import { provideHover } from './hover';

/**
 * Returns the hover text for the specified tag.
 *
 * @param tag
 * @returns Hover text
 */
function hoverTextForTag(tag: TagName) {
  return TAG_DOCS[tag].detail;
}

describe('Hover Provider', () => {
  it('should provide hover details for @NAME', () => {
    const line = '@NAME(Search) -- search';
    const hover = provideHover(positionParams(0, 4), line) as Hover;
    expect(hover).withContext('Hover').not.toBeNull();
    expect(hover.contents).withContext('Hover contents').toEqual(hoverTextForTag('NAME'));
  });

  it('should provide a hover range for @NAME', () => {
    const line = '@NAME(Search) -- search';
    const hover = provideHover(positionParams(12, 4), line) as Hover;
    expect(hover).withContext('Hover').not.toBeNull();
    expect(hover.range)
      .withContext('Hover range')
      .toEqual(lineRange(Position.create(12, 0), 5));
  });

  it('should provide a hover at any point in the tag', () => {
    const line = '@NAME(Search) -- search';
    const hover = provideHover(positionParams(0, 0), line) as Hover;
    expect(hover).withContext('Hover').not.toBeNull();
    expect(hover.contents).withContext('Hover contents').toEqual(hoverTextForTag('NAME'));
    expect(hover.range)
      .withContext('Hover range')
      .toEqual(lineRange(Position.create(0, 0), 5));
  });

  it('should not provide a hover for the tag params', () => {
    const line = '@NAME(Search) -- search';
    expect(provideHover(positionParams(0, 5), line)).toBeNull();
  });

  it('should handle multiple tags per line', () => {
    const line = '  UPPER(name) @LIKE UPPER(:name) @INCLUDE(NameMatcher)';

    const likeHover = provideHover(positionParams(2, 14), line) as Hover;
    expect(likeHover).withContext('@LIKE Hover').not.toBeNull();
    expect(likeHover.contents).withContext('@LIKE Hover contents').toEqual(hoverTextForTag('LIKE'));
    expect(likeHover.range)
      .withContext('@LIKE Hover range')
      .toEqual(lineRange(Position.create(2, 14), 5));

    const includeHover = provideHover(positionParams(2, 37), line) as Hover;
    expect(includeHover).withContext('@INCLUDE Hover').not.toBeNull();
    expect(includeHover.contents)
      .withContext('@INCLUDE Hover contents')
      .toEqual(hoverTextForTag('INCLUDE'));
    expect(includeHover.range)
      .withContext('@INCLUDE Hover range')
      .toEqual(lineRange(Position.create(2, 33), 8));
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
      expect(hover)
        .withContext(tag + ' Hover')
        .not.toBeNull();
      expect(hover.contents)
        .withContext(tag + ' Hover contents')
        .toEqual(hoverTextForTag(tag as TagName));
    });
  });
});
