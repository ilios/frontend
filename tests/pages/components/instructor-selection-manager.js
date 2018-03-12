import {
  clickable,
  collection,
  fillable,
  hasClass
} from 'ember-cli-page-object';

export default {
  scope: '[data-test-instructor-selection-manager]',
  search: fillable('.search-box input'),
  searchResults: collection({
    scope: '.results',
    itemScope: '[data-test-result]',
    item: {
      add: clickable(),
      active: hasClass('active'),
      inactive: hasClass('inactive'),
    },
  }),
  instructors: collection({
    scope: '[data-test-instructors]',
    itemScope: 'li',
    item: {
      remove: clickable()
    }
  }),
  instructorGroups: collection({
    scope: '[data-test-instructor-groups]',
    itemScope: 'li',
    item: {
      remove: clickable()
    }
  }),
};
