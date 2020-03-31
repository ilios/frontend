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
  scope: '[data-test-program-year-objective-list-item]',
  hasRemoveConfirmation: hasClass('confirm-removal'),
  toggleExpandCollapse: clickable('[data-test-toggle-expand]'),
  description: {
    scope: 'td:eq(1)',
    openEditor: clickable('[data-test-edit]'),
    editorContents: pageObjectFroalaEditorValue('[data-test-html-editor]'),
    edit: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
    save: clickable('.done'),
    validationError: text('.validation-error-message'),
    hasValidationError: isVisible('.validation-error-message'),
  },
  hasCompetency: isVisible('[data-test-competency]'),
  competencyTitle: text('[data-test-competency]'),
  hasDomain: isVisible('[data-test-domain]'),
  domainTitle: text('[data-test-domain]'),
  manageCompetency: clickable('[data-test-manage-competency]', { scope: 'td:eq(2)' }),
  meshTerms: collection('[data-test-mesh-descriptors] [data-test-term]', {
    title: text(),
  }),
  meshText: text('[data-test-mesh-descriptors]'),
  manageMesh: clickable('[data-test-manage]', { scope: '[data-test-mesh-descriptors]' }),
  remove: clickable('[data-icon="trash"]', { scope: '[data-test-actions]'}),
  hasTrashCan: isVisible('[data-icon="trash"]', { scope: '[data-test-actions]'}),
};

export default definition;
export const component = create(definition);
