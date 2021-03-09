import { create, collection } from 'ember-cli-page-object';
import listItem from './list-item';

const definition = {
  scope: '[data-test-program-year-list]',
  items: collection('[data-test-program-year-list-item]', listItem),
};

export default definition;
export const component = create(definition);
