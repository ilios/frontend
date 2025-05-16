import {
  clickable,
  create,
  fillable,
  isPresent,
  text,
  triggerable,
  value,
} from 'ember-cli-page-object';

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
    hasError: isPresent('[data-test-administrator-email-validation-error-message]'),
    error: text('[data-test-administrator-email-validation-error-message]'),
    save: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
  },
  changeAlertRecipients: {
    scope: '[data-test-change-alert-recipients]',
    label: text('label'),
    set: fillable('input'),
    value: value('input'),
    hasError: isPresent('[data-test-change-alert-recipients-validation-error-message]'),
    error: text('[data-test-change-alert-recipients-validation-error-message]'),
    save: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
  },
});

export default definition;
export const component = create(definition);
