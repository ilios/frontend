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
} from 'ilios/tests/helpers/froala-editor';
import meshManager from './mesh-manager';


export default {
  scope: '[data-test-detail-objectives]',
  createNew: clickable('.detail-objectives-actions button'),
  save: clickable('.detail-objectives-actions button.bigadd'),
  cancel: clickable('.detail-objectives-actions button.bigcancel'),
  newObjective: {
    description: fillInFroalaEditor('.fr-box'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    canSave: property('disabled', '.done'),
    validationError: text('.validation-error-message'),
    hasValidationError: isVisible('.validation-error-message'),
  },
  current: collection({
    scope: 'table',
    itemScope: 'tbody tr',
    item: {
      description: {
        scope: 'td:eq(0)',
        openEditor: clickable('.editable'),
        editorContents: froalaEditorValue('.fr-box'),
        edit: fillInFroalaEditor('.fr-box'),
        save: clickable('.done'),
        validationError: text('.validation-error-message'),
        hasValidationError: isVisible('.validation-error-message'),
      },
      parents: collection({
        scope: 'td:eq(1)',
        itemScope: '[data-test-parent]',
        item: {
          description: text(),
        },
      }, { at: 1 }),
      manageParents: clickable('.clickable:eq(0)', { scope: 'td:eq(1)' }),
      meshTerms: collection({
        scope: 'td:eq(2)',
        itemScope: '[data-test-term]',
        item: {
          title: text(),
        },
      }, { at: 1 }),
      manageMesh: clickable('li:eq(0)', { scope: 'td:eq(2) .mesh-descriptor-list' }),
    },
  }),
  meshManager,
};
