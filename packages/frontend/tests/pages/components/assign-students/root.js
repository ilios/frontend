import { collection, create, fillable, property, value } from 'ember-cli-page-object';
import assignStudents from '../assign-students';

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
  assignStudents,
};

export default definition;
export const component = create(definition);
