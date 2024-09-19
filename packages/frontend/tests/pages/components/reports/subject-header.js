import { clickable, create, collection, fillable, value } from 'ember-cli-page-object';

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
  download: clickable('[data-test-download]'),
};

export default definition;
export const component = create(definition);
