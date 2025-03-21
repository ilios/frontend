import {
  create,
  clickable,
  collection,
  fillable,
  property,
  isVisible,
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
  titleErrors: collection('[data-test-title-validation-error-message]'),
};

export default definition;
export const component = create(definition);
