import {
  clickable,
  create,
  collection,
  isVisible,
  property,
  text,
} from 'ember-cli-page-object';
import { pageObjectFillInFroalaEditor } from 'ilios-common';
import manageObjectiveDescriptors from './manage-objective-descriptors';
import manageObjectiveCompetency from './manage-objective-competency';
import objectiveList from './objective-list';

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
  expanded: collection('table tbody [data-test-program-year-objective-list-item-expanded-course]', {
    courseTitle: text('[data-test-title]'),
    objectives: collection('[data-test-course-objective]'),
  }),
  objectiveList,
  manageObjectiveCompetency,
  manageObjectiveDescriptors,
};

export default definition;
export const component = create(definition);
