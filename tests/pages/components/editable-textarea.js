import { clickable, create, isPresent, property, text } from 'ember-cli-page-object';
import { pageObjectFillInQuillEditor, pageObjectQuillEditorValue } from '../helpers';

const definition = {
  scope: '[data-test-editable-textarea]',
  value: text(),
  editable: {
    scope: '[data-test-edit]',
    edit: clickable(),
  },
  editor: {
    scope: '[data-test-editor]',
    hasHtmlEditor: isPresent('[data-test-html-editor]'),
    hasActions: isPresent('[data-test-actions]'),
  },
  htmlEditor: {
    value: pageObjectQuillEditorValue('[data-test-html-editor]'),
    set: pageObjectFillInQuillEditor('[data-test-html-editor]'),
  },
  saveDisabled: property('disabled', '[data-test-save]'),
  cancelDisabled: property('disabled', '[data-test-cancel]'),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
};

export default definition;
export const component = create(definition);
