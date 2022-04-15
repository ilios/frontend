import { attribute, clickable, create, hasClass, isVisible, text } from 'ember-cli-page-object';

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
  isDeletable: isVisible('[data-test-delete]'),
};

export default definition;
export const component = create(definition);
