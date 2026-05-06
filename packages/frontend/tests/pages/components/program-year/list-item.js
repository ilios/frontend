import { clickable, create, isVisible, text } from 'ember-cli-page-object';
import { findOne } from 'ember-cli-page-object/extend';
import { getter } from 'ember-cli-page-object/macros';

const definition = {
  scope: '[data-test-program-year-list-item]',
  link: {
    scope: '[data-test-link]',
  },
  title: text('[data-test-title]'),
  competencies: {
    scope: '[data-test-competencies]',
  },
  objectives: {
    scope: '[data-test-objectives]',
  },
  directors: {
    scope: '[data-test-directors]',
  },
  terms: {
    scope: '[data-test-terms]',
  },
  canBeRemoved: isVisibleAndEnabled('[data-test-remove]'),
  remove: clickable('[data-test-remove]'),
  unlock: clickable('[data-test-unlock]'),
  canBeUnlocked: isVisibleAndEnabled('[data-test-unlock]'),
  lock: clickable('[data-test-lock]'),
  isLocked: isVisible('[data-test-unlock]'),
  isUnlocked: isVisible('[data-test-lock]'),
  canBeLocked: isVisibleAndEnabled('[data-test-lock]'),
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
