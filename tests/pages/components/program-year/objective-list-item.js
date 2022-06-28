import { clickable, create, hasClass, isVisible, text } from 'ember-cli-page-object';
import { pageObjectFillInFroalaEditor, pageObjectFroalaEditorValue } from 'ilios-common';
import meshManager from './manage-objective-descriptors';
import competencyManager from './manage-objective-competency';
import meshDescriptors from './objective-list-item-descriptors';
import competency from './objective-list-item-competency';
import taxonomyManager from 'ilios-common/page-objects/components/taxonomy-manager';
import selectedTerms from 'ilios-common/page-objects/components/objective-list-item-terms';

const definition = {
  scope: '[data-test-program-year-objective-list-item]',
  hasRemoveConfirmation: hasClass('confirm-removal'),
  toggleExpandCollapse: clickable('[data-test-toggle-expand]'),
  description: {
    scope: '[data-test-description]',
    openEditor: clickable('[data-test-edit]'),
    editorContents: pageObjectFroalaEditorValue('[data-test-html-editor]'),
    edit: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
    save: clickable('.done'),
    validationError: text('.validation-error-message'),
    hasValidationError: isVisible('.validation-error-message'),
  },
  competency,
  meshDescriptors,
  remove: clickable('[data-test-remove]', { scope: '[data-test-actions]' }),
  canBeRemoved: isVisible('[data-test-remove]', { scope: '[data-test-actions]' }),
  activate: clickable('[data-test-activate]', { scope: '[data-test-actions]' }),
  isActive: isVisible('[data-icon="lightbulb-on"]', { scope: '[data-test-actions]' }),
  deactivate: clickable('[data-test-deactivate]', { scope: '[data-test-actions]' }),
  isInactive: isVisible('[data-icon="lightbulb-slash"]', { scope: '[data-test-actions]' }),
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
  },
  meshManager,
  competencyManager,
  selectedTerms,
  taxonomyManager,
};

export default definition;
export const component = create(definition);
