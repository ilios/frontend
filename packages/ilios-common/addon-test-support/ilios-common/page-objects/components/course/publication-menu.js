import { clickable, create, isVisible, isHidden } from 'ember-cli-page-object';
import { focusedText, keyOnFocus } from 'ilios-common';

const definition = {
  scope: '[data-test-course-publication-menu]',
  toggle: {
    scope: '[data-test-toggle]',
    enter: keyOnFocus('Enter'),
    down: keyOnFocus('ArrowDown'),
    esc: keyOnFocus('Escape'),
  },
  menu: {
    scope: '[data-test-menu]',
    down: keyOnFocus('ArrowDown'),
    up: keyOnFocus('ArrowUp'),
  },
  menuClosed: isHidden('[data-test-menu]'),
  menuOpen: isVisible('[data-test-menu]'),
  hasPublish: isVisible('[data-test-publish]'),
  hasReview: isVisible('[data-test-review]'),
  hasTbd: isVisible('[data-test-tbd]'),
  hasUnPublish: isVisible('[data-test-un-publish]'),
  publish: clickable('[data-test-publish]'),
  reviewMisingItems: clickable('[data-test-review]'),
  markAsScheduled: clickable('[data-test-tbd]'),
  unpublishCourse: clickable('[data-test-un-publish]'),
  selectedMenuItem: focusedText('[data-test-menu]'),
};

export default definition;
export const component = create(definition);
