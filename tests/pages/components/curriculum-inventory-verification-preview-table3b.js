import {
  attribute,
  create,
  collection,
  text,
} from 'ember-cli-page-object';

export default create({
  scope: '[data-test-curriculum-inventory-verification-preview-table3b]',
  title: text('[data-test-title]'),
  table: {
    scope: 'table',
    headings: collection('thead tr th'),
    rows: collection('tbody tr', {
      title: text('td', {at: 0}),
      level: text('td', {at: 1}),
      weeks: text('td', {at: 2}),
      avg: text('td', {at: 3}),
    }),
  },
  backToTop: {
    scope: '[data-test-back-to-top]',
    link: attribute('href'),
  },
});
