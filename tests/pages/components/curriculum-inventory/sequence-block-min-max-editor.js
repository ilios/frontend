import {
  create,
  clickable,
  fillable,
  text,
  value,
  isVisible,
  property,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-curriculum-inventory-sequence-block-min-max-editor]',
  minimum: {
    scope: '[data-test-minimum]',
    label: text('label'),
    value: value('input'),
    set: fillable('input'),
    isDisabled: property('disabled', 'input'),
    hasError: isVisible('.validation-error-message'),
  },
  maximum: {
    scope: '[data-test-maximum]',
    label: text('label'),
    value: value('input'),
    set: fillable('input'),
    hasError: isVisible('.validation-error-message'),
  },
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
};

export default definition;
export const component = create(definition);
