import {
  clickable,
  create,
  collection,
  fillable,
  isPresent,
  property,
  text,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-header]',
  title: {
    scope: '[data-test-report-title]',
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    value: value('input'),
    hasError: isPresent('[data-test-title-validation-error-message]'),
    error: text('[data-test-title-validation-error-message]'),
    cancel: clickable('.cancel'),
    save: clickable('.done'),
  },
  academicYears: {
    scope: '[data-test-report-subject-year-filter]',
    choose: fillable('select'),
    items: collection('select option', {
      isSelected: property('selected'),
    }),
  },
  description: text('[data-test-report-description]'),
  hasYearFilter: isPresent('[data-test-year-filter]'),
};

export default definition;
export const component = create(definition);
