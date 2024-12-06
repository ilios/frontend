import { create, collection, triggerable } from 'ember-cli-page-object';
import { hasFocus } from 'ilios-common';
export default create({
  scope: '[data-test-choose-new-report]',
  toggle: {
    scope: '[data-test-toggle]',
    enter: triggerable('keyup', '', { eventProperties: { key: 'Enter' } }),
    down: triggerable('keyup', '', { eventProperties: { key: 'ArrowDown' } }),
    esc: triggerable('keyup', '', { eventProperties: { key: 'Escape' } }),
    hasFocus: hasFocus(),
  },
  types: collection('[data-test-item]', {
    hasFocus: hasFocus(),
    mouseEnter: triggerable('mouseenter'),
    down: triggerable('keyup', '', { eventProperties: { key: 'ArrowDown' } }),
    esc: triggerable('keyup', '', { eventProperties: { key: 'Escape' } }),
    left: triggerable('keyup', '', { eventProperties: { key: 'ArrowLeft' } }),
    right: triggerable('keyup', '', { eventProperties: { key: 'ArrowRight' } }),
    tab: triggerable('keyup', '', { eventProperties: { key: 'Tab' } }),
    up: triggerable('keyup', '', { eventProperties: { key: 'ArrowUp' } }),
  }),
  subject: {
    scope: '[data-test-item]:nth-of-type(1)',
  },
});
