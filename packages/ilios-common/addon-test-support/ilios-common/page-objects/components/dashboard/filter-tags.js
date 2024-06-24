import { create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-dashboard-filter-tags]',
  // @todo implement [ST 2024/06/24]
};

export default definition;
export const component = create(definition);
