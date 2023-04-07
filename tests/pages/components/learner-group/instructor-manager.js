import { clickable, collection, create, fillable, hasClass, text } from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';
import membersList from './instructor-group-members-list';

const definition = {
  scope: '[data-test-learner-group-instructor-manager]',
  title: text('[data-test-title]'),
  cancel: clickable('[data-test-cancel]'),
  manage: clickable('[data-test-manage]'),
  save: clickable('[data-test-save]'),
  cancelButton: {
    scope: '[data-test-cancel]',
  },
  manageButton: {
    scope: '[data-test-manage]',
  },
  saveButton: {
    scope: '[data-test-save]',
  },
  assignedInstructors: collection('[data-test-assigned-instructor]', {
    userNameInfo,
  }),
  selectedInstructors: collection('[data-test-selected-instructor]', {
    userNameInfo,
    remove: clickable(),
  }),
  selectedInstructorGroups: collection('[data-test-selected-instructor-group]', {
    title: text('[data-test-instructor-group-title]'),
    remove: clickable('[data-test-instructor-group-title]'),
    membersList,
  }),
  search: fillable('.search-box input'),
  searchResults: collection('.results [data-test-result]', {
    add: clickable(),
    active: hasClass('active'),
    inactive: hasClass('inactive'),
  }),
};

export default definition;
export const component = create(definition);
