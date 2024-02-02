import { clickable, collection, fillable, hasClass, notHasClass } from 'ember-cli-page-object';

export default {
  scope: '[data-test-leadership-manager]',
  selectedDirectors: collection('[data-test-directors] ul li', {
    remove: clickable('.remove'),
  }),
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
  selectedAdministrators: collection('[data-test-administrators] ul li', {
    remove: clickable('.remove'),
  }),
  studentAdvisorSearch: {
    scope: '[data-test-student-advisor-search] [data-test-leadership-search]',
    search: fillable('input[type=search]'),
    results: collection('.results [data-test-result]', {
      add: clickable('[data-test-select-user]'),
      isSelectable: hasClass('clickable'),
      isSelected: notHasClass('clickable'),
    }),
  },
  selectedStudentAdvisors: collection('[data-test-student-advisors] ul li', {
    remove: clickable('.remove'),
  }),
};
