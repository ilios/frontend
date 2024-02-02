import {
  clickable,
  collection,
  create,
  fillable,
  text,
  triggerable,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-login-form]',
  errors: collection('[data-test-error]'),
  form: {
    scope: '[data-test-form]',
    title: text('[data-test-title]'),
    username: {
      scope: '[data-test-username]',
      label: text('label'),
      set: fillable('input'),
      value: value('input'),
      submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
      errors: collection('.validation-error-message'),
    },
    password: {
      scope: '[data-test-password]',
      label: text('label'),
      set: fillable('input'),
      value: value('input'),
      submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
      errors: collection('.validation-error-message'),
    },
    login: clickable('[data-test-login]'),
    submit: triggerable('keyup', '[data-test-username] input', {
      eventProperties: { key: 'Enter' },
    }),
  },
};

export default definition;
export const component = create(definition);
