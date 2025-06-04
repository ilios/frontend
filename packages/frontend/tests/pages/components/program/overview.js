import { create, clickable, isPresent, fillable, collection, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-program-overview]',
  shortTitle: {
    scope: '[data-test-short-title]',
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    editable: isPresent('[data-test-edit]'),
    value: text('[data-test-value]'),
    hasError: isPresent('[data-test-title-validation-error-message]'),
    error: text('[data-test-title-validation-error-message]'),
  },
  duration: {
    scope: '[data-test-duration]',
    edit: clickable('[data-test-edit]'),
    set: fillable('select'),
    save: clickable('.done'),
    options: collection('select option'),
    editable: isPresent('[data-test-edit]'),
    value: text('[data-test-value]'),
  },
};

export default definition;
export const component = create(definition);
