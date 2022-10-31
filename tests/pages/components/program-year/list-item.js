import { clickable, create, isPresent, isVisible, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-program-year-list-item]',
  link: {
    scope: '[data-test-link]',
  },
  title: text('[data-test-title]'),
  competencies: {
    scope: '[data-test-competencies]',
    hasWarning: isPresent('[data-test-warning]'),
  },
  objectives: {
    scope: '[data-test-objectives]',
    hasWarning: isPresent('[data-test-warning]'),
  },
  directors: {
    scope: '[data-test-directors]',
    hasWarning: isPresent('[data-test-warning]'),
  },
  terms: {
    scope: '[data-test-terms]',
    hasWarning: isPresent('[data-test-warning]'),
  },
  canBeRemoved: isVisible('[data-test-remove]'),
  remove: clickable('[data-test-remove]'),
  unlock: clickable('[data-test-unlock]'),
  canBeUnlocked: isVisible('[data-test-unlock]'),
  lock: clickable('[data-test-lock]'),
  isLocked: isVisible('[data-test-unlock]'),
  isUnlocked: isVisible('[data-test-lock]'),
  canBeLocked: isVisible('[data-test-lock]'),
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
