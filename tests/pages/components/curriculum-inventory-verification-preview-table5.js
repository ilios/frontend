import {
  attribute,
  create,
  collection,
  text,
} from 'ember-cli-page-object';

export default create({
  scope: '[data-test-curriculum-inventory-verification-preview-table5]',
  title: text('[data-test-title]'),
  table: {
    scope: 'table',
    firstHeadings: collection('thead tr:eq(0) th'),
    secondHeadings: collection('thead tr:eq(1) th'),
    rows: collection('tbody tr', {
      cells: collection('td'),
    }),
  },
  backToTop: {
    scope: '[data-test-back-to-top]',
    link: attribute('href'),
  },
});
