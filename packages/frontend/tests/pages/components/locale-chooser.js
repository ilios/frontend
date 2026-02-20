import { create, collection, triggerable } from 'ember-cli-page-object';
import { hasFocus } from 'ilios-common';
export default create({
  scope: '[data-test-locale-chooser]',
  toggle: {
    scope: '[data-test-toggle]',
    enter: triggerable('keyup', '', { eventProperties: { key: 'Enter' } }),
    down: triggerable('keydown', '', { eventProperties: { key: 'ArrowDown' } }),
    esc: triggerable('keydown', '', { eventProperties: { key: 'Escape' } }),
    hasFocus: hasFocus(),
  },
  locales: collection('[data-test-item]', {
    hasFocus: hasFocus(),
    mouseEnter: triggerable('mouseenter'),
    down: triggerable('keydown', '', { eventProperties: { key: 'ArrowDown' } }),
    esc: triggerable('keydown', '', { eventProperties: { key: 'Escape' } }),
    left: triggerable('keydown', '', { eventProperties: { key: 'ArrowLeft' } }),
    right: triggerable('keydown', '', { eventProperties: { key: 'ArrowRight' } }),
    tab: triggerable('keydown', '', { eventProperties: { key: 'Tab' } }),
    up: triggerable('keydown', '', { eventProperties: { key: 'ArrowUp' } }),
  }),
});
