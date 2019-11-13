import {
  create,
  collection,
  triggerable,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-choose-material-type]',
  toggle: {
    scope: '[data-test-toggle]',
    enter: triggerable('keydown', '', { eventProperties: { key: 'Enter' } }),
    down: triggerable('keydown', '', { eventProperties: { key: 'ArrowDown' } }),
    esc: triggerable('keydown', '', { eventProperties: { key: 'Escape' } }),
  },
  types: collection('[data-test-item]', {
  })
};

export default definition;
export const component = create(definition);
