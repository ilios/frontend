import { create, collection, fillable, property } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-new-course]',
  year: {
    scope: '[data-test-year]',
    options: collection('option', {
      isSelected: property('selected'),
    }),
    set: fillable('select'),
    value: property('value', 'select'),
  },
  course: {
    scope: '[data-test-course]',
    options: collection('option', {
      isSelected: property('selected'),
    }),
    set: fillable('select'),
    value: property('value', 'select'),
  },
};

export default definition;
export const component = create(definition);
