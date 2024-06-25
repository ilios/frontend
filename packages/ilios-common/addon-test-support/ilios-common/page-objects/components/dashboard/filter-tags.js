import { collection, create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-dashboard-filter-tags]',
  tags: collection('[data-test-filter-tag]'),
  clearAll: {
    scope: '[data-test-clear-filters]',
  },
};

export default definition;
export const component = create(definition);
