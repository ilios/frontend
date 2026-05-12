import { attribute, clickable, create, hasClass, property, text } from 'ember-cli-page-object';
import { findOne } from 'ember-cli-page-object/extend';
import { getter } from 'ember-cli-page-object/macros';
import publicationStatus from 'ilios-common/page-objects/components/publication-status';

const definition = {
  scope: '[data-test-courses-list-item]',
  title: text('[data-test-course-title]'),
  level: text('[data-test-level]'),
  startDate: text('[data-test-start-date]'),
  endDate: text('[data-test-end-date]'),
  publicationStatus,
  status: {
    scope: '[data-test-status]',
    isLocked: hasClass('fa-lock', 'svg', { at: 1 }),
    canLock: isVisibleAndEnabled('[data-test-lock]'),
    lock: clickable('[data-test-lock]'),
    lockIcon: {
      scope: '[data-test-lock]',
      at: 1,
      title: attribute('title'),
      isDisabled: property('disabled'),
    },
    isUnlocked: hasClass('fa-lock-open', 'svg', { at: 1 }),
    canUnlock: isVisibleAndEnabled('[data-test-unlock]'),
    unLock: clickable('[data-test-unlock]'),
    unlockIcon: {
      scope: '[data-test-unlock]',
      at: 1,
      title: attribute('title'),
      isDisabled: hasClass('disabled'),
    },
    canRemove: isVisibleAndEnabled('[data-test-remove]'),
    remove: clickable('[data-test-remove]'),
    removeIcon: {
      scope: '[data-test-remove]',
      title: attribute('title'),
      isDisabled: property('disabled'),
    },
  },
};

function isVisibleAndEnabled(selector) {
  return getter(function (pageObjectKey) {
    return !findOne(this, selector, { pageObjectKey }).disabled;
  });
}

export default definition;
export const component = create(definition);
