import {
  clickable,
  create,
  collection,
  fillable,
  is,
  triggerable,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-global-search-box]',
  input: fillable('input'),
  inputValue: value('input'),
  inputHasFocus: is(':focus', 'input'),
  triggerInput: triggerable('keyup', 'input'),
  clickIcon: clickable('[data-test-search-icon]'),
  autocompleteResults: collection('[data-test-autocomplete] li'),
  escape: triggerable('keyup', 'input', { eventProperties: { keyCode: 27 } }),
  enter: triggerable('keyup', 'input', { eventProperties: { keyCode: 13 } }),
};

export default definition;
export const component = create(definition);
