import {
  clickable,
  collection,
  create,
  fillable,
  hasClass,
  isPresent,
  text,
} from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';
import membersList from './instructor-group-members-list';

const definition = {
  scope: '[data-test-learner-group-instructor-manager]',
  title: text('[data-test-title]'),
  cancel: {
    scope: '[data-test-cancel]',
  },
  save: {
    scope: '[data-test-save]',
  },
  selectedInstructors: collection('[data-test-selected-instructor]', {
    isDisabled: isPresent('.disabled-user'),
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
    add: clickable('button'),
    active: hasClass('active'),
    inactive: hasClass('inactive'),
  }),
};

export default definition;
export const component = create(definition);
