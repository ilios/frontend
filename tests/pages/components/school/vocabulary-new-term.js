import { clickable, create, isPresent, fillable, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-vocabulary-new-term]',
  setTitle: fillable('input'),
  save: clickable('.save'),
  hasError: isPresent('[data-test-title-validation-error-message]'),
  errorMessage: text('[data-test-title-validation-error-message]'),
};

export default definition;
export const component = create(definition);
