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
import manageObjectiveDescriptors from './manage-objective-descriptors';
import manageObjectiveCompetency from './manage-objective-competency';

const definition = {
  scope: '[data-test-program-year-objectives]',
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
  current: collection('table tbody [data-test-programyear-objective-list-item]', {
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
    meshTerms: collection('td:eq(3) [data-test-term]', {
      title: text(),
    }, { at: 1 }),
    manageMesh: clickable('[data-test-term]'),
  }),
  expanded: collection('table tbody [data-test-programyear-objective-list-item-expanded]', {
    courseTitle: text('[data-test-course]'),
    objectives: collection('[data-test-course-objectives] [data-test-course-objective]'),
  }),
  manageObjectiveCompetency,
  manageObjectiveDescriptors,
};

export default definition;
export const component = create(definition);
