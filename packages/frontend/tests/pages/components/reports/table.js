import { clickable, collection, create, hasClass } from 'ember-cli-page-object';
import tableRow from './table-row';

const definition = {
  scope: '[data-test-reports-table]',
  reports: collection('[data-test-reports-table-row]', tableRow),
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
