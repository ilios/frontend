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
  scope: '[data-test-courses-new]',
  title: fillable('[data-test-title]'),
  titleHasValidationError: isPresent(
    '[data-test-title-validation-error-message]',
    '[data-test-title]',
  ),
  chooseYear: fillable('[data-test-year]'),
  submitOnEnter: triggerable('keyup', '[data-test-title]', { eventProperties: { key: 'Enter' } }),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  years: collection('[data-test-year] option', {
    text: text(),
    selected: property('selected'),
  }),
};

export default definition;
export const component = create(definition);
