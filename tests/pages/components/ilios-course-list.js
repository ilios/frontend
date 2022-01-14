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
    title: text('td', { at: 0 }),
    school: text('td', { at: 1 }),
    year: text('td', { at: 2 }),
    level: text('td', { at: 3 }),
    startDate: text('td', { at: 4 }),
    endDate: text('td', { at: 5 }),
    status: text('td', { at: 6 }),
    isLocked: hasClass('fa-lock', 'svg', { scope: 'td:eq(6)', at: 0 }),
    isUnlocked: hasClass('fa-unlock', 'svg', { scope: 'td:eq(6)', at: 0 }),
    lock: clickable('[data-test-lock]', { scope: 'td:eq(6)' }),
    canLock: isVisible('[data-test-lock]', { scope: 'td:eq(6)' }),
    canUnlock: isVisible('[data-test-unlock]', { scope: 'td:eq(6)' }),
    unLock: clickable('[data-test-unlock]', { scope: 'td:eq(6)' }),
    remove: clickable('[data-test-remove]', { scope: 'td:eq(6)' }),
    removeActionCount: count('[data-test-remove]', { scope: 'td:eq(6)' }),
  }),
  emptyListRowIsVisible: isVisible('[data-test-empty-list]'),
  sortByTitle: clickable('button', { scope: '[data-test-course-headings] th:nth-of-type(1)' }),
  sortByLevel: clickable('button', { scope: '[data-test-course-headings] th:nth-of-type(4)' }),
  sortByStartDate: clickable('button', { scope: '[data-test-course-headings] th:nth-of-type(5)' }),
  sortByEndDate: clickable('button', { scope: '[data-test-course-headings] th:nth-of-type(6)' }),
  sortByStatus: clickable('button', { scope: '[data-test-course-headings] th:nth-of-type(7)' }),
  confirmCourseRemoval: clickable('[data-test-courses] .confirm-removal button.remove'),
  isSortedByTitleAscending: hasClass(
    'fa-sort-alpha-down',
    '[data-test-course-headings] th:eq(0) svg'
  ),
  isSortedByTitleDescending: hasClass(
    'fa-sort-alpha-down-alt',
    '[data-test-course-headings] th:eq(0) svg'
  ),
  isSortedByLevelAscending: hasClass(
    'fa-sort-numeric-down',
    '[data-test-course-headings] th:eq(3) svg'
  ),
  isSortedByLevelDescending: hasClass(
    'fa-sort-numeric-down-alt',
    '[data-test-course-headings] th:eq(3) svg'
  ),
  isSortedByStartDateAscending: hasClass(
    'fa-sort-numeric-down',
    '[data-test-course-headings] th:eq(4) svg'
  ),
  isSortedByStartDateDescending: hasClass(
    'fa-sort-numeric-down-alt',
    '[data-test-course-headings] th:eq(4) svg'
  ),
  isSortedByEndDateAscending: hasClass(
    'fa-sort-numeric-down',
    '[data-test-course-headings] th:eq(5) svg'
  ),
  isSortedByEndDateDescending: hasClass(
    'fa-sort-numeric-down-alt',
    '[data-test-course-headings] th:eq(5) svg'
  ),
  isSortedByStatusAscending: hasClass(
    'fa-sort-alpha-down',
    '[data-test-course-headings] th:eq(6) svg'
  ),
  isSortedByStatusDescending: hasClass(
    'fa-sort-alpha-down-alt',
    '[data-test-course-headings] th:eq(6) svg'
  ),
};

export default definition;
export const component = create(definition);
