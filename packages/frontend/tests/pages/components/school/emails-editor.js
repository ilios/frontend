import { clickable, create, fillable, isPresent, text, value } from 'ember-cli-page-object';

const definition = create({
  scope: '[data-test-school-emails-editor]',
  title: text('[data-test-title]'),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  administratorEmail: {
    scope: '[data-test-administrator-email]',
    label: text('label'),
    set: fillable('input'),
    value: value('input'),
    hasError: isPresent('.validation-error-message'),
    errorMessage: text('.validation-error-message'),
  },
  changeAlertRecipients: {
    scope: '[data-test-change-alert-recipients]',
    label: text('label'),
    set: fillable('input'),
    value: value('input'),
    hasError: isPresent('.validation-error-message'),
    errorMessage: text('.validation-error-message'),
  },
});

export default definition;
export const component = create(definition);
