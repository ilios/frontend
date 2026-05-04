import {
  clickable,
  create,
  fillable,
  hasClass,
  isVisible,
  text,
  triggerable,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-password-validator]',
  label: text('label'),
  fillIn: fillable('input'),
  value: value('input'),
  validate: clickable('button'),
  hasError: isVisible('.validation-error-message'),
  submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
  strength: {
    scope: '[data-test-password-strength-text]',
    hasZeroClass: hasClass('strength-0'),
    hasOneClass: hasClass('strength-1'),
    hasTwoClass: hasClass('strength-2'),
    hasThreeClass: hasClass('strength-3'),
    hasFourClass: hasClass('strength-4'),
  },
  meter: {
    scope: '[data-test-password-strength-meter]',
  },
};

export default definition;
export const component = create(definition);
