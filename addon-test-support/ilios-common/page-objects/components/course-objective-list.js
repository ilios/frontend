import {
  clickable,
  collection,
  create,
  isVisible,
  text
} from 'ember-cli-page-object';
import {
  pageObjectFillInFroalaEditor,
  pageObjectFroalaEditorValue
} from 'ilios-common';

const definition = {
  scope: '[data-test-course-objective-list]',
  canSort: isVisible('[data-test-sort]'),
  listHeadings: collection('[data-test-objectives] thead th'),
  objectives: collection('[data-test-course-objective-list-item]', {
    description: {
      scope: '[data-test-description]',
      openEditor: clickable('[data-test-edit]'),
      editorContents: pageObjectFroalaEditorValue('[data-test-html-editor]'),
      edit: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
      save: clickable('.done'),
      validationError: text('.validation-error-message'),
      hasValidationError: isVisible('.validation-error-message'),
    },
    parents: collection('[data-test-parents] [data-test-parent]', {
      description: text(),
    }, { at: 1 }),
    manageParents: clickable('.clickable:eq(0)', { scope: '[data-test-parents]' }),
    meshTerms: collection('[data-test-mesh] [data-test-term]', {
      title: text(),
    }, { at: 1 }),
    manageMesh: clickable('li:eq(0)', { scope: '[data-test-mesh] .mesh-descriptor-list' }),
    remove: clickable('[data-test-remove]'),
  }),
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
  },
};

export default definition;
export const component = create(definition);
