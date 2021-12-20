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
  sortByTitle: clickable('th', { scope: '[data-test-course-headings]', at: 0 }),
  sortByLevel: clickable('th', { scope: '[data-test-course-headings]', at: 3 }),
  sortByStartDate: clickable('th', { scope: '[data-test-course-headings]', at: 4 }),
  sortByEndDate: clickable('th', { scope: '[data-test-course-headings]', at: 5 }),
  sortByStatus: clickable('th', { scope: '[data-test-course-headings]', at: 6 }),
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
