import {
  clickable,
  collection,
  create,
  fillable,
  isPresent,
  property,
  text,
  triggerable,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-new-course]',
  title: fillable('[data-test-title]'),
  titleHasValidationError: isPresent('.validation-error-message', '[data-test-title]'),
  chooseYear: fillable('[data-test-year]'),
  submitOnEnter: triggerable('keydown', '[data-test-title]', { eventProperties: { key: 'Enter' } }),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  years: collection('[data-test-year] option', {
    text: text(),
    selected: property('selected'),
  }),
};

export default definition;
export const component = create(definition);
