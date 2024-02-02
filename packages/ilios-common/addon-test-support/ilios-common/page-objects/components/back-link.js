import { create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-back-link]',
};

export default definition;
export const component = create(definition);
