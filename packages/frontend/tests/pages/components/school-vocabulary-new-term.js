import { clickable, create, isPresent, fillable, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-vocabulary-new-term]',
  setTitle: fillable('input'),
  save: clickable('.save'),
  hasError: isPresent('.validation-error-message'),
  errorMessage: text('.validation-error-message'),
};

export default definition;
export const component = create(definition);
