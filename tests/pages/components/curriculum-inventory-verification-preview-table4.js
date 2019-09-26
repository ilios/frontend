import {
  create,
  collection,
  text,
} from 'ember-cli-page-object';

export default create({
  scope: '[data-test-curriculum-inventory-verification-preview-table4]',
  title: text('[data-test-title]'),
  table: {
    scope: 'table',
    headings: collection('thead tr th'),
    rows: collection('tbody tr', {
      id: text('td', {at: 0}),
      title: text('td', {at: 1}),
      numPrimary: text('td', {at: 2}),
      numNonPrimary: text('td', {at: 3})
    }),
    footer: collection('tfoot tr td'),
  },
});
