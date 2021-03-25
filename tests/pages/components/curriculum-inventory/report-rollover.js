import {
  clickable,
  collection,
  create,
  fillable,
  isVisible,
  property,
  text,
  triggerable,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-curriculum-inventory-report-rollover]',
  name: {
    scope: '[data-test-name]',
    value: value('input'),
    label: text('label'),
    set: fillable('input'),
    submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
    hasValidationError: isVisible('.validation-error-message'),
  },
  description: {
    scope: '[data-test-description]',
    value: text('textarea'),
    label: text('label'),
    set: fillable('textarea'),
  },
  years: {
    scope: '[data-test-years]',
    label: text('label'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    select: fillable('select'),
    value: value('select'),
  },
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
};

export default definition;
export const component = create(definition);
