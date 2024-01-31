import { create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-curriculum-inventory-leadership-collapsed]',
};

export default definition;
export const component = create(definition);
