import {
  clickable,
  create,
  collection,
  fillable,
  isPresent,
  property,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-header]',
  title: {
    scope: '[data-test-report-title]',
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    value: value('input'),
    errors: collection('.validation-error-message'),
    cancel: clickable('.cancel'),
    save: clickable('.done'),
  },
  isDownloadDisabled: property('disabled', '[data-test-download]'),
  download: clickable('[data-test-download]'),
  hasYearFilter: isPresent('[data-test-year-filter]'),
};

export default definition;
export const component = create(definition);
