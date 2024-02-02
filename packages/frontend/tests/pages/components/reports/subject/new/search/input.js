import { create, collection, fillable, triggerable, isPresent } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-report-search-input]',
  input: fillable('input'),
  hasInput: isPresent('input'),
  triggerInput: triggerable('keyup', 'input'),
  results: collection('[data-test-results] button'),
};

export default definition;
export const component = create(definition);
