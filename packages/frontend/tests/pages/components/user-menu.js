import { create, collection, triggerable } from 'ember-cli-page-object';
import linkToWithAction from 'frontend/tests/pages/components/link-to-with-action';

export default create({
  scope: '[data-test-user-menu]',
  toggle: {
    scope: '[data-test-toggle]',
    enter: triggerable('keyup', '', { eventProperties: { key: 'Enter' } }),
    down: triggerable('keyup', '', { eventProperties: { key: 'ArrowDown' } }),
    esc: triggerable('keyup', '', { eventProperties: { key: 'Escape' } }),
  },
  links: collection('[data-test-item]', {
    link: linkToWithAction,
  }),
});
