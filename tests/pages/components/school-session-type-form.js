import {
  attribute,
  clickable,
  collection,
  create,
  isVisible,
  fillable,
  property,
  triggerable,
  text,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-session-type-form]',
  title: {
    scope: '[data-test-title]',
    set: fillable('input'),
    value: value('input'),
    hasError: isVisible('.validation-error-message'),
    submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
    cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
    inputControlIsVisible: isVisible('input'),
    readonlyValue: text('.value'),
  },
  aamcMethod: {
    scope: '[data-test-aamc-method]',
    select: fillable('select'),
    value: value('select'),
    options: collection('option', {
      selected: property('selected'),
    }),
    inputControlIsVisible: isVisible('select'),
    readonlyValue: text('.value'),
  },
  calendarColor: {
    scope: '[data-test-color]',
    set: fillable('input'),
    value: value('input'),
    hasError: isVisible('.validation-error-message'),
    submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
    cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
    inputControlIsVisible: isVisible('input'),
    readonlyValue: text('.value'),
    colorboxStyle: attribute('style', '[data-test-colorbox]'),
  },
  assessment: {
    scope: '[data-test-assessment]',
    toggle: clickable('[data-test-toggle-yesno] [data-test-handle]'),
    inputControlIsVisible: isVisible('[data-test-toggle-yesno]'),
    readonlyValue: text('.value'),
    isAssessment: property('checked', 'input'),
  },
  assessmentSelector: {
    scope: '[data-test-assessment-options]',
    select: fillable('select'),
    value: value('select'),
    options: collection('option', {
      selected: property('selected'),
    }),
    inputControlIsVisible: isVisible('select'),
    readonlyValue: text('.value'),
  },
  active: {
    scope: '[data-test-active]',
    toggle: clickable('[data-test-toggle-yesno] [data-test-handle]'),
    readonlyValue: text('.value'),
    inputControlIsVisible: isVisible('[data-test-toggle-yesno]'),
    isActive: property('checked', 'input'),
  },
  submit: {
    scope: '[data-test-submit]',
  },
  cancel: {
    scope: '[data-test-cancel]',
  },
  close: {
    scope: '[data-test-close]',
  },
};

export default definition;
export const component = create(definition);
