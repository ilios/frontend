import {
  clickable,
  create,
  collection,
  isPresent,
  text,
  visitable
} from 'ember-cli-page-object';

import selectable from '../helpers/selectable';

export default create({
  scope: '[data-test-dashboard]',
  visit: visitable('/dashboard'),
  myReports: {
    scope: '[data-test-myreports]',
    reports: collection({
      itemScope: '[data-test-saved-reports] tr',
      item: {
        title: text('td:eq(0)'),
        select: clickable('.clickable', { scope: 'td:eq(0)' })
      },
    }),
    selectedReport: {
      scope: '[data-test-selected-report]',
      title: text('[data-test-report-title]'),
      yearsFilterExists: isPresent('[data-test-year-filter]'),
      chooseYear: selectable('[data-test-year-filter]'),
      results: collection({
        itemScope: '[data-test-results] li',
        item: {
          title: text(),
        },
      }),
    },
  },
});
