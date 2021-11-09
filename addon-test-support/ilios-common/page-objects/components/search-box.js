import {
  attribute,
  create,
  clickable,
  fillable,
  is,
  triggerable,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-search-box]',
  submit: clickable('[data-test-submit-search]'),
  set: fillable('input'),
  value: value('input'),
  inputHasFocus: is(':focus', 'input'),
  placeholder: attribute('placeholder', 'input'),
  esc: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
};

export default definition;
export const component = create(definition);
