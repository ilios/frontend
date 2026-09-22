import { create, collection, fillable, clickable, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-new-learning-material]',
  input: fillable('input'),
  search: clickable('[data-test-submit-search]'),
  results: collection('[data-test-results] button'),
  hasSelectedMaterial: isPresent('[data-test-selected-learning-material]'),
  selectedMaterial: text('[data-test-selected-learning-material]'),
};

export default definition;
export const component = create(definition);
