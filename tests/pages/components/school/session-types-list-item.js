import { attribute, clickable, create, hasClass, text } from 'ember-cli-page-object';
import { findOne } from 'ember-cli-page-object/extend';
import { getter } from 'ember-cli-page-object/macros';

const definition = {
  scope: '[data-test-school-session-types-list-item]',
  title: {
    scope: '[data-test-title]',
    edit: clickable('button'),
  },
  sessionCount: text('[data-test-sessions-count]'),
  isAssessment: hasClass('yes', '[data-test-is-assessment] svg'),
  assessmentOption: text('[data-test-assessment-option]'),
  aamcMethod: text('[data-test-assessment-method-description]'),
  calendarColor: attribute('style', '[data-test-colorbox]'),
  manage: clickable('[data-test-manage]'),
  delete: clickable('[data-test-delete]'),
  isDeletable: isVisibleAndEnabled('[data-test-delete]'),
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    message: text('[data-test-message]'),
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
    resetScope: true,
  },
};

function isVisibleAndEnabled(selector) {
  return getter(function (pageObjectKey) {
    return !findOne(this, selector, { pageObjectKey }).disabled;
  });
}

export default definition;
export const component = create(definition);
