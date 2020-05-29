import { create, clickable, fillable, text, value, isVisible } from 'ember-cli-page-object';
import { datePicker } from 'ilios-common';

const definition = {
  scope: '[data-test-curriculum-inventory-sequence-block-dates-duration-editor]',
  duration: {
    scope: '[data-test-duration]',
    label: text('label'),
    value: value('input'),
    set: fillable('input'),
    hasError: isVisible('.validation-error-message'),
  },
  startDate: {
    scope: '[data-test-startdate]',
    label: text('label'),
    value: value('input'),
    set: datePicker('input'),
    hasError: isVisible('.validation-error-message')
  },
  endDate: {
    scope: '[data-test-enddate]',
    label: text('label'),
    value: value('input'),
    set: datePicker('input'),
    hasError: isVisible('.validation-error-message', { multiple: true })
  },
  save: clickable('.done'),
  cancel: clickable('.cancel'),
};

export default definition;
export const component = create(definition);
