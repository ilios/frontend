import {
  collection,
  text
} from 'ember-cli-page-object';

export default {
  scope: '[data-test-leadership-collapsed]',
  title: text('.title'),
  headers: collection({
    scope: 'thead',
    itemScope: 'th',
    item: {
      title: text(),
    },
  }),
  summary: collection({
    scope: 'tbody',
    itemScope: 'tr',
    item: {
      name: text('td', { at: 0 }),
      value: text('td', { at: 1 }),
    },
  }),
};
