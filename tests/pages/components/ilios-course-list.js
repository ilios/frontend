import {
  clickable,
  collection,
  count,
  create,
  hasClass,
  isVisible,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-ilios-course-list]',
  courses: collection('[data-test-active-row]', {
    title: text('[data-test-course-title]'),
    level: text('[data-test-level]'),
    startDate: text('[data-test-start-date]'),
    endDate: text('[data-test-end-date]'),
    status: text('[data-test-status]'),
    isLocked: hasClass('fa-lock', 'svg', { scope: '[data-test-status]', at: 1 }),
    isUnlocked: hasClass('fa-unlock', 'svg', { scope: '[data-test-status]', at: 1 }),
    lock: clickable('[data-test-lock]', { scope: '[data-test-status]' }),
    canLock: isVisible('[data-test-lock]', { scope: '[data-test-status]' }),
    canUnlock: isVisible('[data-test-unlock]', { scope: '[data-test-status]' }),
    unLock: clickable('[data-test-unlock]', { scope: '[data-test-status]' }),
    remove: clickable('[data-test-remove]', { scope: '[data-test-status]' }),
    removeActionCount: count('[data-test-remove]', { scope: '[data-test-status]' }),
  }),
  emptyListRowIsVisible: isVisible('[data-test-empty-list]'),
  sortByTitle: clickable('button', { scope: '[data-test-course-headings] th:nth-of-type(1)' }),
  sortByLevel: clickable('button', { scope: '[data-test-course-headings] th:nth-of-type(2)' }),
  sortByStartDate: clickable('button', { scope: '[data-test-course-headings] th:nth-of-type(3)' }),
  sortByEndDate: clickable('button', { scope: '[data-test-course-headings] th:nth-of-type(4)' }),
  sortByStatus: clickable('button', { scope: '[data-test-course-headings] th:nth-of-type(5)' }),
  confirmCourseRemoval: clickable('[data-test-courses] .confirm-removal button.remove'),
  isSortedByTitleAscending: hasClass(
    'fa-arrow-down-a-z',
    '[data-test-course-headings] th:eq(0) svg'
  ),
  isSortedByTitleDescending: hasClass(
    'fa-arrow-down-z-a',
    '[data-test-course-headings] th:eq(0) svg'
  ),
  isSortedByLevelAscending: hasClass(
    'fa-arrow-down-1-9',
    '[data-test-course-headings] th:eq(1) svg'
  ),
  isSortedByLevelDescending: hasClass(
    'fa-arrow-down-9-1',
    '[data-test-course-headings] th:eq(1) svg'
  ),
  isSortedByStartDateAscending: hasClass(
    'fa-arrow-down-1-9',
    '[data-test-course-headings] th:eq(2) svg'
  ),
  isSortedByStartDateDescending: hasClass(
    'fa-arrow-down-9-1',
    '[data-test-course-headings] th:eq(2) svg'
  ),
  isSortedByEndDateAscending: hasClass(
    'fa-arrow-down-1-9',
    '[data-test-course-headings] th:eq(3) svg'
  ),
  isSortedByEndDateDescending: hasClass(
    'fa-arrow-down-9-1',
    '[data-test-course-headings] th:eq(3) svg'
  ),
  isSortedByStatusAscending: hasClass(
    'fa-arrow-down-a-z',
    '[data-test-course-headings] th:eq(4) svg'
  ),
  isSortedByStatusDescending: hasClass(
    'fa-arrow-down-z-a',
    '[data-test-course-headings] th:eq(4) svg'
  ),
};

export default definition;
export const component = create(definition);
