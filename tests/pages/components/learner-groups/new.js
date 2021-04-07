import { create, clickable, fillable, isVisible, property } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-new-learner-group]',
  title: fillable('[data-test-title]'),
  save: clickable('.done'),
  cancel: clickable('.cancel'),
  isVisible: isVisible(),
  willFill: property('checked', '[data-test-fill] input'),
  fillWithCohort: clickable('[data-test-fill]'),
  doNotFillWithCohort: clickable('[data-test-no-fill]'),
};

export default definition;
export const component = create(definition);
