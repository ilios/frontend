import { attribute, clickable, create, hasClass, isVisible, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-session-types-list-item]',
  title: {
    scope: '[data-test-title]',
    edit: clickable('button'),
  },
  isActive: isVisible('[data-icon="lightbulb-on"]', { scope: '[data-test-active]' }),
  isInactive: isVisible('[data-icon="lightbulb-slash"]', { scope: '[data-test-active]' }),
  sessionCount: text('[data-test-sessions-count]'),
  isAssessment: hasClass('yes', '[data-test-is-assessment] svg'),
  assessmentOption: text('[data-test-assessment-option]'),
  aamcMethod: text('[data-test-assessment-method-description]'),
  calendarColor: attribute('style', '[data-test-colorbox]'),
  manage: clickable('[data-test-manage]'),
  delete: clickable('[data-test-delete]'),
  isDeletable: isVisible('[data-test-delete]'),
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    message: text('[data-test-message]'),
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
    resetScope: true,
  },
};

export default definition;
export const component = create(definition);
