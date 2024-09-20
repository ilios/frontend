import { create } from 'ember-cli-page-object';
import list from './list';
import results from './results';
import runSubject from './run-subject';

const definition = {
  scope: '[data-test-reports-root]',
  list,
  results,
  runSubject,
};

export default definition;
export const component = create(definition);
