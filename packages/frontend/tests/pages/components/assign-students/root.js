import { collection, create, fillable, property, value } from 'ember-cli-page-object';
import manager from './manager';

const definition = {
  scope: '[data-test-assign-students-root]',
  schoolFilter: {
    scope: '[data-test-school-filter]',
    selectedSchool: value('select'),
    set: fillable('select'),
    options: collection('option', {
      selected: property('selected'),
    }),
    titleFilter: {
      set: fillable('input'),
      value: value('input'),
    },
  },
  manager,
};

export default definition;
export const component = create(definition);
