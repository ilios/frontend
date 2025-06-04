import {
  create,
  clickable,
  fillable,
  property,
  isPresent,
  isVisible,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-new-single-learner-group]',
  title: fillable('[data-test-title] input'),
  save: clickable('.done'),
  cancel: clickable('.cancel'),
  isVisible: isVisible(),
  canFill: isVisible('[data-test-fill]'),
  willFill: property('checked', '[data-test-fill] input'),
  fillWithCohort: clickable('[data-test-fill]'),
  doNotFillWithCohort: clickable('[data-test-no-fill]'),
  hasError: isPresent('[data-test-title-validation-error-message]'),
  error: text('[data-test-title-validation-error-message]'),
};

export default definition;
export const component = create(definition);
