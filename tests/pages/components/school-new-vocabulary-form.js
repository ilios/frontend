import { create, isVisible, fillable, triggerable, text, value } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-new-vocabulary-form]',
  title: {
    scope: '[data-test-title]',
    set: fillable('input'),
    value: value('input'),
    label: text('label'),
    hasError: isVisible('.validation-error-message'),
    submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
    cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
    inputControlIsVisible: isVisible('input'),
    readonlyValue: text('.value'),
  },
  submit: {
    scope: '[data-test-submit]',
  },
  cancel: {
    scope: '[data-test-cancel]',
  },
};

export default definition;
export const component = create(definition);
