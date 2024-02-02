import { create, property } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-toggle-buttons]',
  firstButton: {
    scope: '[data-test-first-input]',
    isChecked: property('checked'),
  },
  firstLabel: {
    scope: '[data-test-first-label]',
  },
  secondButton: {
    scope: '[data-test-second-input]',
    isChecked: property('checked'),
  },
  secondLabel: {
    scope: '[data-test-second-label]',
  },
};

export default definition;
export const component = create(definition);
