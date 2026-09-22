import { collection, clickable, create, property, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-vocabulary-filter]',
  vocabularies: collection('[data-test-dashboard-selected-vocabulary]', {
    title: text('[data-test-title]'),
    terms: collection('[data-test-selected-term-tree]', {
      title: text(),
      toggle: clickable('[data-test-target]'),
      isChecked: property('checked', '[data-test-target] input'),
    }),
  }),
};

export default definition;
export const component = create(definition);
