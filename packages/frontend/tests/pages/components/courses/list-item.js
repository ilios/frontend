import {
  attribute,
  clickable,
  create,
  hasClass,
  isVisible,
  property,
  text,
} from 'ember-cli-page-object';
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
    canLock: isVisible('[data-test-lock]'),
    lock: clickable('[data-test-lock]'),
    lockIcon: {
      scope: '[data-test-lock]',
      at: 1,
      label: attribute('aria-label'),
      title: attribute('title'),
      isDisabled: property('disabled'),
    },
    isUnlocked: hasClass('fa-lock-open', 'svg', { at: 1 }),
    canUnlock: isVisible('[data-test-unlock]'),
    unLock: clickable('[data-test-unlock]'),
    unlockIcon: {
      scope: '[data-test-unlock]',
      at: 1,
      label: attribute('aria-label'),
      title: attribute('title'),
      isDisabled: hasClass('disabled'),
    },
    canRemove: isVisible('[data-test-remove]'),
    remove: clickable('[data-test-remove]'),
    removeIcon: {
      scope: '[data-test-remove]',
      label: attribute('aria-label'),
      title: attribute('title'),
      isDisabled: property('disabled'),
    },
  },
};

export default definition;
export const component = create(definition);
