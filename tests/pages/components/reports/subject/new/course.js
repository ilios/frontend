import { clickable, create, collection, fillable, isPresent } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-new-course]',
  input: fillable('input'),
  search: clickable('button'),
  results: collection('[data-test-results] button', {
    isSelected: isPresent('svg.remove'),
  }),
};

export default definition;
export const component = create(definition);
