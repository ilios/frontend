import {
  clickable,
  create,
  collection,
  isVisible,
  property,
  text,
} from 'ember-cli-page-object';
import {
  pageObjectFillInFroalaEditor,
  pageObjectFroalaEditorValue
} from 'ilios-common';
import meshManager from '../mesh-manager';
import manageObjectiveParents from './manage-objective-parents';

const definition = {
  scope: '[data-test-course-objectives]',
  createNew: clickable('[data-test-actions] [data-test-expand-collapse-button] button'),
  save: clickable('[data-test-actions] [data-test-save]'),
  cancel: clickable('[data-test-actions] [data-test-cancel]'),
  newObjective: {
    description: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    canSave: property('disabled', '.done'),
    validationError: text('.validation-error-message'),
    hasValidationError: isVisible('.validation-error-message'),
  },
  current: collection('table tbody tr', {
    description: {
      scope: 'td:eq(0)',
      openEditor: clickable('[data-test-edit]'),
      editorContents: pageObjectFroalaEditorValue('[data-test-html-editor]'),
      edit: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
      save: clickable('.done'),
      validationError: text('.validation-error-message'),
      hasValidationError: isVisible('.validation-error-message'),
    },
    parents: collection('td:eq(1) [data-test-parent]', {
      description: text(),
    }, { at: 1 }),
    manageParents: clickable('.clickable:eq(0)', { scope: 'td:eq(1)' }),
    meshTerms: collection('td:eq(2) [data-test-term]', {
      title: text(),
    }, { at: 1 }),
    manageMesh: clickable('li:eq(0)', { scope: 'td:eq(2) .mesh-descriptor-list' }),
  }),
  manageObjectiveParents,
  meshManager,
};

export default definition;
export const component = create(definition);
