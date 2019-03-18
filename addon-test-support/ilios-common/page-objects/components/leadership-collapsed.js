import {
  collection,
  text
} from 'ember-cli-page-object';

export default {
  scope: '[data-test-leadership-collapsed]',
  title: text('.title'),
  headers: collection('thead th', {
    title: text(),
  }),
  summary: collection('tbody tr', {
    name: text('td', { at: 0 }),
    value: text('td', { at: 1 }),
  }),
};
