import {
  collection,
  text
} from 'ember-cli-page-object';

export default {
  scope: '[data-test-collapsed-taxonomies]',
  title: text('.title'),
  headers: collection('thead th', {
    title: text(),
  }),
  vocabularies: collection('tbody tr', {
    name: text('td', { at: 0 }),
    school: text('td', { at: 1 }),
    terms: text('td', { at: 2 }),
  }),
};
