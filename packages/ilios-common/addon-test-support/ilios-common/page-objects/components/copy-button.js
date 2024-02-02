import { create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-copy-button]',
};

export default definition;
export const component = create(definition);
