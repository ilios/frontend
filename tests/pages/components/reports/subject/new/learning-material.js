import { create, collection, fillable, clickable, isPresent } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-new-learning-material]',
  input: fillable('input'),
  search: clickable('button'),
  results: collection('[data-test-results] button', {
    isSelected: isPresent('svg.remove'),
  }),
};

export default definition;
export const component = create(definition);
