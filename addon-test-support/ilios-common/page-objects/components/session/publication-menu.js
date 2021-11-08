import {
  collection,
  clickable,
  create,
  triggerable,
  isVisible,
  isHidden,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-session-publication-menu]',
  toggle: {
    scope: '[data-test-toggle]',
    enter: triggerable('keyup', '', { eventProperties: { key: 'Enter' } }),
    down: triggerable('keyup', '', { eventProperties: { key: 'ArrowDown' } }),
    esc: triggerable('keyup', '', { eventProperties: { key: 'Escape' } }),
  },
  buttons: collection('[data-test-menu] button'),
  menuClosed: isHidden('[data-test-menu]'),
  menuOpen: isVisible('[data-test-menu]'),
  hasPublishAsIs: isVisible('[data-test-publish-as-is]'),
  hasPublish: isVisible('[data-test-publish]'),
  hasReview: isVisible('[data-test-review]'),
  hasTbd: isVisible('[data-test-tbd]'),
  hasUnPublish: isVisible('[data-test-un-publish]'),
  publishAsIs: clickable('[data-test-publish-as-is]'),
  publish: clickable('[data-test-publish]'),
  reviewMisingItems: clickable('[data-test-review]'),
  markAsScheduled: clickable('[data-test-tbd]'),
  unpublishSession: clickable('[data-test-un-publish]'),
};

export default definition;
export const component = create(definition);
