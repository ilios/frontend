import {
  clickable,
  collection,
  create,
  fillable,
  isVisible,
  property,
  text,
  value,
} from 'ember-cli-page-object';

import courseSearchResult from './course-search-result';
import searchBox from './global-search-box';

const definition = {
  scope: '[data-test-global-search]',
  searchBox,
  noResultsIsVisible: isVisible('.no-results'),
  academicYear: value('[data-test-academic-year-filter]'),
  academicYearOptions: text('[data-test-academic-year-filter]'),
  courseTitleLinks: collection('.course-title-link'),
  selectAcademicYear: fillable('[data-test-academic-year-filter]'),
  schoolFilters: collection('[data-test-school-filters] [data-test-school-filter]', {
    isSelected: property('checked', 'input'),
    isDisabled: property('disabled', 'input'),
    school: text('label'),
    toggle: clickable('label'),
  }),
  searchResults: collection('[data-test-course-search-result]', courseSearchResult),
};

export default definition;
export const component = create(definition);
