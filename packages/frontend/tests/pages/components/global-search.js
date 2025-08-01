import { clickable, collection, create, isVisible, property, text } from 'ember-cli-page-object';

import courseSearchResult from './course-search-result';
import searchBox from './global-search-box';

const definition = {
  scope: '[data-test-global-search]',
  searchBox,
  noResultsIsVisible: isVisible('.no-results'),
  courseTitleLinks: collection('.course-title-link'),
  schoolFilters: collection('[data-test-school-filters] [data-test-school-filter]', {
    isSelected: property('checked', 'input'),
    isDisabled: property('disabled', 'input'),
    school: text('label'),
    toggle: clickable('label'),
  }),
  yearFilters: collection('[data-test-year-filters] [data-test-year-filter]', {
    isSelected: property('checked', 'input'),
    isDisabled: property('disabled', 'input'),
    year: text('label'),
    toggle: clickable('label'),
  }),
  searchResults: collection('[data-test-course-search-result]', courseSearchResult),
  searchIsRunning: isVisible('[data-test-searching]'),
  didYouMean: {
    scope: '[data-test-did-you-mean]',
    url: property('href', 'a'),
  },
};

export default definition;
export const component = create(definition);
