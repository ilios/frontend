import { create, collection, triggerable } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-choose-material-type]',
  toggle: {
    scope: '[data-test-toggle]',
    enter: triggerable('keyup', '', { eventProperties: { key: 'Enter' } }),
    down: triggerable('keyup', '', { eventProperties: { key: 'ArrowDown' } }),
    esc: triggerable('keyup', '', { eventProperties: { key: 'Escape' } }),
  },
  types: collection('[data-test-item]', {}),
};

export default definition;
export const component = create(definition);
