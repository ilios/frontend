import { clickable, collection, create, hasClass } from 'ember-cli-page-object';
import listItem from './list-item';

const definition = {
  scope: '[data-test-courses-list]',
  courses: collection('[data-test-courses-list-item]', listItem),
  emptyListRow: {
    scope: '[data-test-empty-list]',
  },
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
