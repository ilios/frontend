import { create } from 'ember-cli-page-object';
import list from './list';
import results from './results';

const definition = {
  scope: '[data-test-reports-root]',
  list,
  results,
};

export default definition;
export const component = create(definition);
