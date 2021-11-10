import { create, collection, fillable, property, value, visitable } from 'ember-cli-page-object';
import assignStudents from './components/assign-students';

export default create({
  visit: visitable('/admin/assignstudents'),
  assignStudents,
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
});
