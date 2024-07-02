import { create, collection, triggerable } from 'ember-cli-page-object';
import { hasFocus } from 'ilios-common';
export default create({
  scope: '[data-test-locale-chooser]',
  toggle: {
    scope: '[data-test-toggle]',
    enter: triggerable('keyup', '', { eventProperties: { key: 'Enter' } }),
    down: triggerable('keyup', '', { eventProperties: { key: 'ArrowDown' } }),
    esc: triggerable('keyup', '', { eventProperties: { key: 'Escape' } }),
    hasFocus: hasFocus(),
  },
  locales: collection('[data-test-item]', {
    hasFocus: hasFocus(),
  }),
});
