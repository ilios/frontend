import {
  clickable,
  count,
  create,
  isVisible,
  property,
  text,
  triggerable,
} from 'ember-cli-page-object';
import { hasFocus } from 'ilios-common';
import fadeText from './fade-text.js';

const definition = {
  scope: '[data-test-editable-field]',
  value: text(),
  hasEditIcon: isVisible('[data-test-edit-icon]'),
  editable: {
    scope: '[data-test-edit]',
    edit: clickable(),
    iconCount: count(),
    title: property('title'),
  },
  enter: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
  escape: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
  cancel: clickable('[data-test-cancel]'),
  inputHasFocus: hasFocus('input'),
  textareaHasFocus: hasFocus('textarea'),
  fadeText,
};

export default definition;
export const component = create(definition);
