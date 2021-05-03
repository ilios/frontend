import { create, collection } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-global-search-tags]',
  tags: collection('[data-test-global-search-tag]'),
};

export default definition;
export const component = create(definition);
