import { clickable, create, fillable, triggerable, value } from 'ember-cli-page-object';
import { hasFocus } from 'ilios-common';

const definition = {
  scope: '[data-test-global-search-box]',
  input: fillable('input'),
  inputValue: value('input'),
  inputHasFocus: hasFocus('input'),
  triggerInput: triggerable('keyup', 'input'),
  clickIcon: clickable('[data-test-search-icon]'),
  keyDown: {
    scope: '[data-test-input]',
    enter: triggerable('keydown', '', { eventProperties: { key: 'Enter' } }),
    escape: triggerable('keydown', '', { eventProperties: { key: 'Escape' } }),
  },
};

export default definition;
export const component = create(definition);
