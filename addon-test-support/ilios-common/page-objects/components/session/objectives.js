import {
  clickable,
  create,
  isVisible,
  property,
  text,
} from 'ember-cli-page-object';
import { pageObjectFillInFroalaEditor } from 'ilios-common';
import objectiveList from './objective-list';
import manageObjectiveDescriptors from './manage-objective-descriptors';
import manageObjectiveParents from './manage-objective-parents';

const definition = {
  scope: '[data-test-session-objectives]',
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
  objectiveList,
  manageObjectiveParents,
  manageObjectiveDescriptors,
};

export default definition;
export const component = create(definition);
