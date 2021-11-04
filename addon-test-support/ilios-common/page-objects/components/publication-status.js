import { create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-publication-status]',
  value: text('[data-test-text]'),
};

export default definition;
export const component = create(definition);
