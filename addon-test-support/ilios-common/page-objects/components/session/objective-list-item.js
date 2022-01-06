import { clickable, create, hasClass, isVisible, text } from 'ember-cli-page-object';
import { pageObjectFillInFroalaEditor, pageObjectFroalaEditorValue } from 'ilios-common';
import meshManager from './manage-objective-descriptors';
import parentManager from './manage-objective-parents';
import meshDescriptors from './objective-list-item-descriptors';
import parents from './objective-list-item-parents';
import selectedTerms from '../objective-list-item-terms';
import taxonomyManager from '../taxonomy-manager';

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
