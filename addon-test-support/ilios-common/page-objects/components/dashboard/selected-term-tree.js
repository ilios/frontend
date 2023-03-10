import { collection, create } from 'ember-cli-page-object';
import checkbox from './filter-checkbox';

const definition = {
  scope: "[data-test-selected-term-tree-level='0']",
  checkboxes: collection('[data-test-filter-checkbox]', checkbox),
  children: collection("[data-test-selected-term-tree-level='1']", {
    children: collection("[data-test-selected-term-tree-level='2']"),
  }),
};

export default definition;
export const component = create(definition);
