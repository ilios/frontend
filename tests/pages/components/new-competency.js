import {clickable, create, fillable, isPresent, text, triggerable} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-new-competency]',
  title: {
    scope: '[data-test-title]',
    set: fillable(),
    submit: triggerable('keyup', null, { eventProperties: { key: 'Enter' } }),
    cancel: triggerable('keyup', null, { eventProperties: { key: 'Escape' } }),
  },
  save: clickable('[data-test-save]'),
  hasError: isPresent('.validation-error-message'),
  errorMessage: text('.validation-error-message'),
};

export default definition;
export const component = create(definition);
