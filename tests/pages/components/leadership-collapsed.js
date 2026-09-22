import { clickable, collection, create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-leadership-collapsed]',
  title: text('[data-test-title]'),
  expand: clickable('[data-test-title]'),
  headers: collection('thead th', {
    title: text(),
  }),
  summary: collection('tbody tr', {
    name: text('td', { at: 0 }),
    value: text('td', { at: 1 }),
  }),
};

export default definition;
export const component = create(definition);
