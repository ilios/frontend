import { create, collection } from 'ember-cli-page-object';
import listItem from './vocabulary-terms-list-item';

const definition = {
  scope: "[data-test-school-vocabulary-terms-list-level='0']",
  items: collection('[data-test-school-vocabulary-terms-list-item-level="0"]', listItem),
  nestedLists: collection('[data-test-school-vocabulary-terms-list-level="1"]', {
    items: collection('[data-test-school-vocabulary-terms-list-item-level="1"]', listItem),
    nestedLists: collection('[data-test-school-vocabulary-terms-list-level="2"]', {
      items: collection('[data-test-school-vocabulary-terms-list-item-level="2"]', listItem),
    }),
  }),
};

export default definition;
export const component = create(definition);
