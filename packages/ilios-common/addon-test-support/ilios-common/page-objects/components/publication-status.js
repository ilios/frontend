import { create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-publication-status]',
  value: text('[data-test-text]'),
  text: {
    scope: '[data-test-text]',
  },
  icon: {
    scope: '[data-test-icon]',
  },
};

export default definition;
export const component = create(definition);
