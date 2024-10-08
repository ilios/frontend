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
    mouseEnter: triggerable('mouseenter'),
    down: triggerable('keyup', '', { eventProperties: { key: 'ArrowDown' } }),
    esc: triggerable('keyup', '', { eventProperties: { key: 'Escape' } }),
    left: triggerable('keyup', '', { eventProperties: { key: 'ArrowLeft' } }),
    right: triggerable('keyup', '', { eventProperties: { key: 'ArrowRight' } }),
    tab: triggerable('keyup', '', { eventProperties: { key: 'Tab' } }),
    up: triggerable('keyup', '', { eventProperties: { key: 'ArrowUp' } }),
  }),
});
