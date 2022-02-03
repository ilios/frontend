import { create, collection, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-curriculum-inventory-verification-preview-table3a]',
  title: text('[data-test-title]'),
  table: {
    scope: 'table',
    headings: collection('thead tr th'),
    rows: collection('tbody tr', {
      title: text('td', { at: 0 }),
      startLevel: text('td', { at: 1 }),
      endLevel: text('td', { at: 2 }),
      weeks: text('td', { at: 3 }),
      avg: text('td', { at: 4 }),
    }),
  },
};

export default definition;
export const component = create(definition);
