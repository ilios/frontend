import { clickable, create, isPresent, fillable, text, value } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-competency-title-editor]',
  title: {
    scope: '[data-test-title]',
    edit: clickable('[data-test-edit]'),
    value: value('input'),
    set: fillable('input'),
    save: clickable('.done'),
  },
  hasError: isPresent('[data-test-title-validation-error-message]'),
  errorMessage: text('[data-test-title-validation-error-message]'),
};

export default definition;
export const component = create(definition);
