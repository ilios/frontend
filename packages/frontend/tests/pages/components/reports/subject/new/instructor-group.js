import { create, collection, fillable, property } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-new-instructor-group]',
  set: fillable('select'),
  options: collection('option', {
    isSelected: property('selected'),
  }),
  value: property('value', 'select'),
};

export default definition;
export const component = create(definition);
