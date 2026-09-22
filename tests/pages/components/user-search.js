import { collection, create } from 'ember-cli-page-object';
import searchBox from './search-box';
import userSearchResult from './user-search-result';
const definition = {
  scope: '[data-test-user-search]',
  searchBox,
  results: {
    scope: '[data-test-results]',
    items: collection('[data-test-result]', userSearchResult),
  },
  resultsCount: {
    scope: '[data-test-results-count]',
  },
};

export default definition;
export const component = create(definition);
