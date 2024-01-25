import { attribute, create, clickable, fillable, triggerable, value } from 'ember-cli-page-object';
import { hasFocus } from 'ilios-common';

const definition = {
  scope: '[data-test-search-box]',
  submit: clickable('[data-test-submit-search]'),
  set: fillable('input'),
  value: value('input'),
  inputHasFocus: hasFocus('input'),
  placeholder: attribute('placeholder', 'input'),
  esc: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
};

export default definition;
export const component = create(definition);
