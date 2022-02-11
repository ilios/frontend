import {
  clickable,
  create,
  collection,
  fillable,
  hasClass,
  triggerable,
  value,
} from 'ember-cli-page-object';
import { hasFocus } from 'ilios-common';

const definition = {
  scope: '[data-test-global-search-box]',
  input: fillable('input'),
  inputValue: value('input'),
  inputHasFocus: hasFocus('input'),
  triggerInput: triggerable('keyup', 'input'),
  clickIcon: clickable('[data-test-search-icon]'),
  autocompleteResults: collection('[data-test-autocomplete] li'),
  resultsRow1HasActiveClass: hasClass('active', 'li:nth-child(1)'),
  resultsRow2HasActiveClass: hasClass('active', 'li:nth-child(2)'),
  resultsRow3HasActiveClass: hasClass('active', 'li:nth-child(3)'),
  keyUp: {
    scope: '[data-test-input]',
    enter: triggerable('keyup', '', { eventProperties: { key: 'Enter' } }),
    down: triggerable('keyup', '', { eventProperties: { key: 'ArrowDown' } }),
    up: triggerable('keyup', '', { eventProperties: { key: 'ArrowUp' } }),
    escape: triggerable('keyup', '', { eventProperties: { key: 'Escape' } }),
  },
};

export default definition;
export const component = create(definition);
