import { collection, create } from 'ember-cli-page-object';
import listItem from './school-competencies-list-item';
const definition = {
  scope: '[data-test-school-competencies-list]',
  items: collection('[data-test-school-competencies-list-item]', listItem),
};

export default definition;
export const component = create(definition);
