import {
  create,
  collection,
  triggerable
} from 'ember-cli-page-object';

export default create({
  scope: '[data-test-user-menu]',
  toggle: {
    scope: '[data-test-toggle]',
    enter: triggerable('keydown', '', { eventProperties: { key: 'Enter' } }),
    down: triggerable('keydown', '', { eventProperties: { key: 'ArrowDown' } }),
    esc: triggerable('keydown', '', { eventProperties: { key: 'Escape' } }),
  },
  links: collection('[data-test-item]', {
  })
});
