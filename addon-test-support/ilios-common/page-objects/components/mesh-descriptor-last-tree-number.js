import { create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-mesh-descriptor-last-tree-number]',
};

export default definition;
export const component = create(definition);
