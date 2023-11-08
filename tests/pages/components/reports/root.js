import { create } from 'ember-cli-page-object';
import list from './list';

const definition = {
  scope: '[data-test-reports-root]',
  list,
};

export default definition;
export const component = create(definition);
