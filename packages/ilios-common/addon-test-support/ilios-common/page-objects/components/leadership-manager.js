import {
  clickable,
  collection,
  create,
  fillable,
  hasClass,
  notHasClass,
} from 'ember-cli-page-object';
import userNameInfo from './user-name-info';
import userStatus from './user-status';

const definition = {
  scope: '[data-test-leadership-manager]',
  directorSearch: {
    scope: '[data-test-director-search] [data-test-leadership-search]',
    search: fillable('input[type=search]'),
    results: collection('.results [data-test-result]', {
      add: clickable('[data-test-select-user]'),
      isSelectable: hasClass('clickable'),
      isSelected: notHasClass('clickable'),
    }),
  },
  administratorSearch: {
    scope: '[data-test-administrator-search] [data-test-leadership-search]',
    search: fillable('input[type=search]'),
    results: collection('.results [data-test-result]', {
      add: clickable('[data-test-select-user]'),
      isSelectable: hasClass('clickable'),
      isSelected: notHasClass('clickable'),
    }),
  },
  studentAdvisorSearch: {
    scope: '[data-test-student-advisor-search] [data-test-leadership-search]',
    search: fillable('input[type=search]'),
    results: collection('.results [data-test-result]', {
      add: clickable('[data-test-select-user]'),
      isSelectable: hasClass('clickable'),
      isSelected: notHasClass('clickable'),
    }),
  },
  selectedDirectors: collection('[data-test-directors] ul li', {
    userNameInfo,
    remove: clickable('.remove'),
    userStatus,
  }),
  selectedAdministrators: collection('[data-test-administrators] ul li', {
    userNameInfo,
    remove: clickable('.remove'),
    userStatus,
  }),
  selectedStudentAdvisors: collection('[data-test-student-advisors] ul li', {
    userNameInfo,
    remove: clickable('.remove'),
    userStatus,
  }),
};

export default definition;
export const component = create(definition);
