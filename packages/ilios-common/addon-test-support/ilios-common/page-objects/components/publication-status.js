import { create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-publication-status]',
  icon: {
    scope: '[data-test-icon]',
    title: text('title'),
  },
};

export default definition;
export const component = create(definition);
