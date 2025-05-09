import {
  attribute,
  clickable,
  create,
  collection,
  fillable,
  isPresent,
  text,
  value,
} from 'ember-cli-page-object';
import academicYears from './subject-year-filter';
import copyNew from './subject-copy-new';

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
  academicYears,
  description: text('[data-test-report-description]'),
  copyNew,
  download: clickable('[data-test-download]'),
  results: collection('[data-test-results] li', {
    link: attribute('href', 'a'),
    hasLink: isPresent('a'),
  }),
};

export default definition;
export const component = create(definition);
