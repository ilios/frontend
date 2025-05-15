import { clickable, create, isPresent, text } from 'ember-cli-page-object';
import { pageObjectFillInFroalaEditor, pageObjectFroalaEditorValue } from 'ilios-common';

const definition = {
  title: text('[data-test-title]'),
  scope: '[data-test-new-objective]',
  description: {
    scope: '[data-test-description]',
    label: text('label'),
    value: pageObjectFroalaEditorValue('[data-test-html-editor]'),
    set: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
    hasError: isPresent('[data-test-description-validation-error-message]'),
    error: text('[data-test-description-validation-error-message]'),
  },
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
};

export default definition;
export const component = create(definition);
