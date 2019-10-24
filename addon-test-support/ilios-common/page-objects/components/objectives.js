import {
  clickable,
  collection,
  isVisible,
  property,
  text,
} from 'ember-cli-page-object';
import {
  fillInFroalaEditor,
  froalaEditorValue
} from 'ilios-common';
import meshManager from './mesh-manager';


export default {
  scope: '[data-test-detail-objectives]',
  createNew: clickable('.detail-objectives-actions button'),
  save: clickable('.detail-objectives-actions button.bigadd'),
  cancel: clickable('.detail-objectives-actions button.bigcancel'),
  newObjective: {
    description: fillInFroalaEditor('[data-test-html-editor]'),
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
      editorContents: froalaEditorValue('.fr-box'),
      edit: fillInFroalaEditor('.fr-box'),
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
  meshManager,
};
