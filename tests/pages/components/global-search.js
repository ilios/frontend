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
  academicYear: value('select'),
  academicYearOptions: text('select'),
  courseTitleLinks: collection('.course-title-link'),
  selectAcademicYear: fillable('select')
};

export default definition;
export const component = create(definition);
