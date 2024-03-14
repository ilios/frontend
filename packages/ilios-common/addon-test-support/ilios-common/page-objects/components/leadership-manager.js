import {
  clickable,
  collection,
  create,
  fillable,
  hasClass,
  isPresent,
  notHasClass,
} from 'ember-cli-page-object';
import userNameInfo from './user-name-info';

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
    isDisabled: isPresent('.disabled-user'),
  }),
  selectedAdministrators: collection('[data-test-administrators] ul li', {
    userNameInfo,
    remove: clickable('.remove'),
    isDisabled: isPresent('.disabled-user'),
  }),
  selectedStudentAdvisors: collection('[data-test-student-advisors] ul li', {
    userNameInfo,
    remove: clickable('.remove'),
    isDisabled: isPresent('.disabled-user'),
  }),
};

export default definition;
export const component = create(definition);
