import { clickable, collection, create, hasClass } from 'ember-cli-page-object';
import listItem from './list-item';

const definition = {
  scope: '[data-test-reports-list]',
  reports: collection('[data-test-reports-list-item]', listItem),
  emptyListRow: {
    scope: '[data-test-empty-list]',
  },
  sortByTitle: clickable('button', { scope: '[data-test-reports-headings] th:nth-of-type(1)' }),
  confirmRemoval: clickable('[data-test-reports] .confirm-removal button.remove'),
  isSortedByTitleAscending: hasClass(
    'fa-arrow-down-a-z',
    '[data-test-course-headings] th:eq(0) svg',
  ),
  isSortedByTitleDescending: hasClass(
    'fa-arrow-down-z-a',
    '[data-test-course-headings] th:eq(0) svg',
  ),
};

export default definition;
export const component = create(definition);
