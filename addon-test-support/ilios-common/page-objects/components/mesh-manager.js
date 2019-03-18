import {
  clickable,
  collection,
  fillable,
  hasClass,
  notHasClass,
  text,
} from 'ember-cli-page-object';

export default {
  scope: '.mesh-manager',
  selectedTerms: collection('.selected-terms li', {
    title: text('.term-title'),
    remove: clickable(),
  }),
  search: fillable('[data-test-search-box] input'),
  runSearch: clickable('[data-test-search-box] .search-icon'),
  searchResults: collection('[data-test-search-results] [data-test-search-result]', {
    title: text('.descriptor-name'),
    isDisabled: hasClass('disabled'),
    isEnabled: notHasClass('disabled'),
    add: clickable(),
  }),
};
