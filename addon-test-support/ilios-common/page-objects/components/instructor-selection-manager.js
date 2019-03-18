import {
  clickable,
  collection,
  fillable,
  hasClass
} from 'ember-cli-page-object';

export default {
  scope: '[data-test-instructor-selection-manager]',
  search: fillable('.search-box input'),
  searchResults: collection('.results [data-test-result]', {
    add: clickable(),
    active: hasClass('active'),
    inactive: hasClass('inactive'),
  }),
  instructors: collection('[data-test-instructors] li', {
    remove: clickable()
  }),
  instructorGroups: collection('[data-test-instructor-groups] li', {
    remove: clickable()
  }),
};
