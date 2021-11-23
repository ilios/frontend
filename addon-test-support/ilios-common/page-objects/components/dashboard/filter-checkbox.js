import { clickable, create, property } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-filter-checkbox]',
  isChecked: property('checked', 'input'),
  click: clickable('input'),
};

export default definition;
export const component = create(definition);
