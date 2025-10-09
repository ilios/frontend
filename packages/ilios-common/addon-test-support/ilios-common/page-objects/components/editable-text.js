import { clickable, create, text } from 'ember-cli-page-object';
import fadeText from './fade-text.js';

const definition = {
  scope: '[data-test-editable-text]',
  value: text(),
  editable: {
    scope: '[data-test-edit]',
    edit: clickable(),
  },
  cancel: clickable('[data-test-cancel]'),
  save: clickable('[data-test-save]'),
  fadeText,
};

export default definition;
export const component = create(definition);
