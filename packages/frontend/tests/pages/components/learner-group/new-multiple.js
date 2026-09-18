import {
  create,
  clickable,
  fillable,
  isVisible,
  isPresent,
  text,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-learner-group-new-multiple]',
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  isVisible: isVisible(),
  set: fillable('input'),
  value: value('input'),
  hasError: isPresent('[data-test-number-of-groups-validation-error-message]'),
  error: text('[data-test-number-of-groups-validation-error-message]'),
};

export default definition;
export const component = create(definition);
