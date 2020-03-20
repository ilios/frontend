import {
  clickable,
  create,
  collection,
  hasClass,
  isVisible,
  text,
} from 'ember-cli-page-object';
import {
  pageObjectFillInFroalaEditor,
  pageObjectFroalaEditorValue
} from 'ilios-common';

const definition = {
  scope: '[data-test-session-objective-list-item]',
  hasRemoveConfirmation: hasClass('confirm-removal'),
  description: {
    scope: '[data-test-description]',
    openEditor: clickable('[data-test-edit]'),
    editorContents: pageObjectFroalaEditorValue('[data-test-html-editor]'),
    edit: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
    save: clickable('.done'),
    validationError: text('.validation-error-message'),
    hasValidationError: isVisible('.validation-error-message'),
  },
  parentsText: text('[data-test-parents]'),
  parents: collection('[data-test-parents] [data-test-parent]', {
    description: text(),
  }, { at: 1 }),
  manageParents: clickable('[data-test-manage-parents]', { scope: '[data-test-parents]' }),
  meshText: text('[data-test-mesh-descriptors]'),
  meshTerms: collection('[data-test-mesh-descriptors] [data-test-term]', {
    title: text(),
  }, { at: 1 }),
  manageMesh: clickable('[data-test-manage]', { scope: '[data-test-mesh-descriptors]' }),
  remove: clickable('[data-icon="trash"]', { scope: '[data-test-actions]'}),
  hasTrashCan: isVisible('[data-icon="trash"]', { scope: '[data-test-actions]'}),
};

export default definition;
export const component = create(definition);
