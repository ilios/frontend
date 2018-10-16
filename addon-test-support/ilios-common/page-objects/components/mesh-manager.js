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
  selectedTerms: collection({
    scope: '.selected-terms',
    itemScope: 'li',
    item: {
      title: text('.term-title'),
      remove: clickable(),
    },
  }),
  search: fillable('[data-test-search-box] input'),
  runSearch: clickable('[data-test-search-box] .search-icon'),
  searchResults: collection({
    scope: '[data-test-search-results]',
    itemScope: '[data-test-search-result]',
    item: {
      title: text('.descriptor-name'),
      isDisabled: hasClass('disabled'),
      isEnabled: notHasClass('disabled'),
      add: clickable(),
    },
  }),
};
