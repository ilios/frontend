import { clickable, create, hasClass, isPresent, isVisible, text } from 'ember-cli-page-object';
import { pageObjectFillInQuillEditor, pageObjectQuillEditorValue } from 'ilios-common';
import fadeText from '../fade-text';
import meshManager from './manage-objective-descriptors';
import parentManager from './manage-objective-parents';
import meshDescriptors from './objective-list-item-descriptors';
import parents from './objective-list-item-parents';
import selectedTerms from '../objective-list-item-terms';
import taxonomyManager from '../taxonomy-manager';

const definition = {
  scope: '[data-test-course-objective-list-item]',
  hasRemoveConfirmation: hasClass('confirm-removal'),
  description: {
    scope: '[data-test-description]',
    openEditor: clickable('[data-test-edit]'),
    fadeText,
    editorContents: pageObjectQuillEditorValue('[data-test-html-editor]'),
    edit: pageObjectFillInQuillEditor('[data-test-html-editor]'),
    save: clickable('.done'),
    hasError: isPresent('[data-test-description-validation-error-message]'),
    error: text('[data-test-description-validation-error-message]'),
  },
  parents,
  meshDescriptors,
  remove: clickable('[data-test-remove]', { scope: '[data-test-actions]' }),
  hasTrashCan: isVisible('[data-icon="trash"]', {
    scope: '[data-test-actions]',
  }),
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
  },
  meshManager,
  parentManager,
  selectedTerms,
  taxonomyManager,
};

export default definition;
export const component = create(definition);
