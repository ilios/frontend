import { create, clickable, fillable, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-instructor-groups-new]',
  title: {
    scope: '[data-test-title]',
    label: text(),
    set: fillable('input'),
    hasError: isPresent('[data-test-title-validation-error-message]'),
    error: text('[data-test-title-validation-error-message]'),
  },
  done: {
    scope: '[data-test-done]',
    click: clickable(),
  },
  cancel: {
    scope: '[data-test-cancel]',
    click: clickable(),
  },
};

export default definition;
export const component = create(definition);
