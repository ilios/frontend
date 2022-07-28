import { create, property } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-user-material-status]',
  isChecked: property('checked', 'input'),
  isIndeterminate: property('indeterminate', 'input'),
};

export default definition;
export const component = create(definition);
