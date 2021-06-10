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
  scope: '[data-test-curriculum-inventory-new-report]',
  programTitle: {
    scope: '[data-test-program-title]',
    label: text('label'),
    title: text('span'),
  },
  academicYear: {
    scope: '[data-test-academic-year]',
    label: text('label'),
    options: collection('select option', {
      isSelected: property('selected'),
    }),
    select: fillable('select'),
    value: value('select'),
  },
  description: {
    scope: '[data-test-description]',
    value: text('textarea'),
    label: text('label'),
    set: fillable('textarea'),
  },
  name: {
    scope: '[data-test-name]',
    value: value('input'),
    label: text('label'),
    set: fillable('input'),
    submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
    hasError: isVisible('.validation-error-message'),
  },
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
};

export default definition;
export const component = create(definition);
