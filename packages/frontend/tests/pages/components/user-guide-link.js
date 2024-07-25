import { create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-user-guide-link]',
  icon: {
    scope: '[data-test-user-guide-link-icon]',
    title: text('title'),
  },
};

export default definition;
export const component = create(definition);
