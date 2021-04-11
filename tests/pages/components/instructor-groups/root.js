import {
  clickable,
  create,
  collection,
  fillable,
  isVisible,
  text,
  value,
} from 'ember-cli-page-object';
import list from './list';
import newInstructorGroupForm from './new';

const definition = {
  scope: '[data-test-instructor-groups]',
  schoolFilter: {
    scope: '[data-test-school-filter]',
    schools: collection('option'),
    select: fillable('select'),
    selectedSchool: value('select'),
  },
  setTitleFilter: fillable('[data-test-title-filter] input'),
  headerTitle: text('h2'),
  toggleNewInstructorGroupForm: clickable('[data-test-expand-collapse-button] button'),
  toggleNewInstructorGroupFormExists: isVisible('[data-test-expand-collapse-button]'),
  list,
  newInstructorGroupForm,
  savedResult: text('.saved-result'),
  emptyListRowIsVisible: isVisible('[data-test-empty-list]'),
};

export default definition;
export const component = create(definition);
