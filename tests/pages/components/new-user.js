import {
  clickable,
  collection,
  create,
  fillable,
  isVisible,
  property,
  triggerable,
  value
} from 'ember-cli-page-object';

import clickChoiceButtons from 'ilios-common/page-objects/components/click-choice-buttons';

const definition = {
  scope: '[data-test-new-user]',
  clickChoiceButtons,
  firstName: {
    scope: '[data-test-first-name]',
    set: fillable('input'),
    value: value('input'),
    hasError: isVisible('.validation-error-message'),
    submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
    cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
  },
  middleName: {
    scope: '[data-test-middle-name]',
    set: fillable('input'),
    value: value('input'),
    hasError: isVisible('.validation-error-message'),
    submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
    cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
  },
  lastName: {
    scope: '[data-test-last-name]',
    set: fillable('input'),
    value: value('input'),
    hasError: isVisible('.validation-error-message'),
    submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
    cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
  },
  campusId: {
    scope: '[data-test-campus-id]',
    set: fillable('input'),
    value: value('input'),
    hasError: isVisible('.validation-error-message'),
    submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
    cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
  },
  otherId: {
    scope: '[data-test-other-id]',
    set: fillable('input'),
    value: value('input'),
    hasError: isVisible('.validation-error-message'),
    submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
    cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
  },
  email: {
    scope: '[data-test-email]',
    set: fillable('input'),
    value: value('input'),
    hasError: isVisible('.validation-error-message'),
    submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
    cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
  },
  phone: {
    scope: '[data-test-phone]',
    set: fillable('input'),
    value: value('input'),
    hasError: isVisible('.validation-error-message'),
    submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
    cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
  },
  username: {
    scope: '[data-test-username]',
    set: fillable('input'),
    value: value('input'),
    hasError: isVisible('.validation-error-message'),
    submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
    cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
  },
  password: {
    scope: '[data-test-password]',
    set: fillable('input'),
    value: value('input'),
    hasError: isVisible('.validation-error-message'),
    submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
    cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
  },
  school: {
    scope: '[data-test-school] select',
    select: fillable(),
    options: collection('option', {
      selected: property('selected'),
    }),
  },
  cohort: {
    scope: '[data-test-cohort] select',
    select: fillable(),
    options: collection('option', {
      selected: property('selected'),
    }),
  },
  submit: clickable('[data-test-submit]'),
  cancel: clickable(['[data-test-cancel]'])
};

export default definition;
export const component = create(definition);
