import {
  collection,
  clickable,
  create,
  text
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-collapsed-taxonomies]',
  title: text('[data-test-title]'),
  expand: clickable('[data-test-title]'),
  headers: collection('thead th', {
    title: text(),
  }),
  vocabularies: collection('tbody tr', {
    name: text('td', { at: 0 }),
    school: text('td', { at: 1 }),
    terms: text('td', { at: 2 }),
  }),
};

export default definition;
export const component = create(definition);
