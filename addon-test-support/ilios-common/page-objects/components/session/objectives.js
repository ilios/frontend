import {
  clickable,
  create,
  isVisible,
  property,
  text,
} from 'ember-cli-page-object';
import { pageObjectFillInFroalaEditor } from 'ilios-common';
import objectiveList from './objective-list';

const definition = {
  scope: '[data-test-session-objectives]',
  title: text('[data-test-title]'),
  createNew: clickable('[data-test-actions] [data-test-expand-collapse-button] button'),
  newObjective: {
    description: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    canSave: property('disabled', '.done'),
    validationError: text('.validation-error-message'),
    hasValidationError: isVisible('.validation-error-message'),
  },
  objectiveList,
};

export default definition;
export const component = create(definition);
