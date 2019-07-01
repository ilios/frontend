import {
  clickable,
  collection,
  create,
  fillable,
  isVisible,
  text,
  value
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-global-search]',
  noResultsIsVisible: isVisible('.no-results'),
  input: fillable('input.global-search-input'),
  clickIcon: clickable('[data-test-search-icon]'),
  academicYear: value('[data-test-academic-year-filter]'),
  academicYearOptions: text('[data-test-academic-year-filter]'),
  courseTitleLinks: collection('.course-title-link'),
  selectAcademicYear: fillable('[data-test-academic-year-filter]')
};

export default definition;
export const component = create(definition);
