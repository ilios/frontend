import { clickable, collection, create, property, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-program-year-managed-competency-list-item]',
  isChecked: property('checked', '[data-test-domain-label] input'),
  isIndeterminate: property('indeterminate', '[data-test-domain-label] input'),
  title: text('[data-test-domain-label]'),
  click: clickable('[data-test-domain-label]'),
  competencies: collection('[data-test-competency]', {
    isChecked: property('checked', 'input'),
  }),
};

export default definition;
export const component = create(definition);
