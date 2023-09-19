import { clickable, create, collection, fillable, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-new-course]',
  input: fillable('input'),
  search: clickable('[data-test-submit-search]'),
  results: collection('[data-test-results] button'),
  hasSelectedCourse: isPresent('[data-test-selected-course]'),
  selectedCourse: text('[data-test-selected-course]'),
};

export default definition;
export const component = create(definition);
