import { create, property } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-dashboard-user-context-filter]',
  instructingLabel: {
    scope: '[data-test-instructing-label]',
  },
  instructingInput: {
    scope: '[data-test-instructing-input]',
    isChecked: property('checked'),
  },
  learningLabel: {
    scope: '[data-test-learning-label]',
  },
  learningInput: {
    scope: '[data-test-learning-input]',
    isChecked: property('checked'),
  },
  adminLabel: {
    scope: '[data-test-admin-label]',
  },
  adminInput: {
    scope: '[data-test-admin-input]',
    isChecked: property('checked'),
  },
};

export default definition;
export const component = create(definition);
