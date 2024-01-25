import { create, text } from 'ember-cli-page-object';
import selectedTermTree from './selected-term-tree';

const definition = {
  scope: '[data-test-dashboard-selected-vocabulary]',
  title: text('[data-test-title]'),
  selectedTermTree,
};

export default definition;
export const component = create(definition);
