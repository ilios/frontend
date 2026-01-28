import { create, attribute } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-user-guide-link]',
  title: attribute('title', 'a'),
  icon: {
    scope: '[data-test-user-guide-link-icon]',
  },
};

export default definition;
export const component = create(definition);
