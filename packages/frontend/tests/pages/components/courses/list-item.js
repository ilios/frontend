import { clickable, create, hasClass, isVisible, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-courses-list-item]',
  title: text('[data-test-course-title]'),
  level: text('[data-test-level]'),
  startDate: text('[data-test-start-date]'),
  endDate: text('[data-test-end-date]'),
  status: text('[data-test-status]'),
  isLocked: hasClass('fa-lock', 'svg', { scope: '[data-test-status]', at: 1 }),
  isUnlocked: hasClass('fa-lock-open', 'svg', { scope: '[data-test-status]', at: 1 }),
  canLock: isVisible('[data-test-lock]', { scope: '[data-test-status]' }),
  canUnlock: isVisible('[data-test-unlock]', { scope: '[data-test-status]' }),
  canRemove: isVisible('[data-test-remove]', { scope: '[data-test-status]' }),
  lock: clickable('[data-test-lock]', { scope: '[data-test-status]' }),
  unLock: clickable('[data-test-unlock]', { scope: '[data-test-status]' }),
  remove: clickable('[data-test-remove]', { scope: '[data-test-status]' }),
};

export default definition;
export const component = create(definition);
