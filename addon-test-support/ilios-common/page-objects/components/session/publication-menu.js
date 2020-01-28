import {
  create,
  triggerable,
  isVisible,
  isHidden
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-session-publication-menu]',
  toggle: {
    scope: '[data-test-toggle]',
    enter: triggerable('keydown', '', { eventProperties: { key: 'Enter' } }),
    down: triggerable('keydown', '', { eventProperties: { key: 'ArrowDown' } }),
    esc: triggerable('keydown', '', { eventProperties: { key: 'Escape' } }),
  },
  menuClosed: isHidden('[data-test-menu]'),
  menuOpen: isVisible('[data-test-menu]'),
  hasPublishAsIs: isVisible('[data-test-publish-as-is]'),
  hasPublish: isVisible('[data-test-publish]'),
  hasReview: isVisible('[data-test-review]'),
  hasTbd: isVisible('[data-test-tbd]'),
  hasUnPublish: isVisible('[data-test-un-publish]'),
};

export default definition;
export const component = create(definition);
