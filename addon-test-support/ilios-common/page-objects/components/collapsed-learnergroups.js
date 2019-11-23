import {
  create,
  collection,
  clickable,
  text
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-collapsed-learnergroups]',
  title: text('[data-test-title]'),
  expand: clickable('[data-test-title]'),
  headers: collection('thead th'),
  groups: collection('tbody tr', {
    cohort: text('td', { at: 0 }),
    count: text('td', { at: 1 }),
  }),
};

export default definition;
export const component = create(definition);
