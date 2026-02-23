import { create, collection, triggerable } from 'ember-cli-page-object';
import linkToWithAction from 'frontend/tests/pages/components/link-to-with-action';

export default create({
  scope: '[data-test-user-menu]',
  toggle: {
    scope: '[data-test-toggle]',
    enter: triggerable('keyup', '', { eventProperties: { key: 'Enter' } }),
    down: triggerable('keydown', '', { eventProperties: { key: 'ArrowDown' } }),
    esc: triggerable('keydown', '', { eventProperties: { key: 'Escape' } }),
  },
  links: collection('[data-test-item]', {
    link: linkToWithAction,
    mouseEnter: triggerable('mouseenter'),
    down: triggerable('keydown', '', { eventProperties: { key: 'ArrowDown' } }),
    esc: triggerable('keydown', '', { eventProperties: { key: 'Escape' } }),
    left: triggerable('keydown', '', { eventProperties: { key: 'ArrowLeft' } }),
    right: triggerable('keydown', '', { eventProperties: { key: 'ArrowRight' } }),
    tab: triggerable('keydown', '', { eventProperties: { key: 'Tab' } }),
    up: triggerable('keydown', '', { eventProperties: { key: 'ArrowUp' } }),
  }),
});
