import {
  attribute,
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
  scope: '[data-test-reports-subject]',
  backToReports: {
    scope: '[data-test-back-to-reports]',
  },
  title: {
    scope: '[data-test-report-title]',
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    value: value('input'),
    errors: collection('.validation-error-message'),
    cancel: clickable('.cancel'),
    save: clickable('.done'),
  },
  description: text('[data-test-report-description]'),
  download: clickable('[data-test-download]'),
  academicYears: {
    scope: '[data-test-year-filter]',
    choose: fillable(),
    items: collection('option', {
      isSelected: property('selected'),
    }),
  },
  results: collection('[data-test-results] li', {
    link: attribute('href', 'a'),
    hasLink: isPresent('a'),
  }),
};

export default definition;
export const component = create(definition);
