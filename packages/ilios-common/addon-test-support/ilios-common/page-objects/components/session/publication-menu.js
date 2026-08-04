import { collection, clickable, create, isVisible, isHidden } from 'ember-cli-page-object';
import { focusedText, keyOnFocus } from 'ilios-common';

const definition = {
  scope: '[data-test-session-publication-menu]',
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
  buttons: collection('[data-test-menu] button'),
  menuClosed: isHidden('[data-test-menu]'),
  menuOpen: isVisible('[data-test-menu]'),
  hasPublish: isVisible('[data-test-publish]'),
  hasReview: isVisible('[data-test-review]'),
  hasTbd: isVisible('[data-test-tbd]'),
  hasUnPublish: isVisible('[data-test-un-publish]'),
  publish: clickable('[data-test-publish]'),
  reviewMisingItems: clickable('[data-test-review]'),
  markAsScheduled: clickable('[data-test-tbd]'),
  unpublishSession: clickable('[data-test-un-publish]'),
  selectedMenuItem: focusedText('[data-test-menu]'),
};

export default definition;
export const component = create(definition);
