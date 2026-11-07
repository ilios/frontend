import { clickable, create, isPresent, text } from 'ember-cli-page-object';
import { pageObjectFillInQuillEditor, pageObjectQuillEditorValue } from '../helpers';

const definition = {
  scope: '[data-test-editable-textarea]',
  value: text(),
  editor: {
    scope: '[data-test-editor]',
    hasHtmlEditor: isPresent('[data-test-html-editor]'),
    hasActions: isPresent('[data-test-actions]'),
  },
  editable: {
    scope: '[data-test-edit]',
    edit: clickable(),
  },
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  htmlEditor: {
    value: pageObjectQuillEditorValue('[data-test-html-editor]'),
    set: pageObjectFillInQuillEditor('[data-test-html-editor]'),
  },
};

export default definition;
export const component = create(definition);
