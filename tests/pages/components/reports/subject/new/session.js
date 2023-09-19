import { clickable, create, collection, fillable, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-new-session]',
  input: fillable('input'),
  search: clickable('[data-test-submit-search]'),
  results: collection('[data-test-results] button'),
  hasSelectedSession: isPresent('[data-test-selected-session]'),
  selectedSession: text('[data-test-selected-session]'),
};

export default definition;
export const component = create(definition);
