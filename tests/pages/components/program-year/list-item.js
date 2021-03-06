import { create, isVisible, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-program-year-list-item]',
  link: {
    scope: '[data-test-link]',
  },
  title: text('[data-test-title]'),
  canBeDeleted: isVisible('[data-test-remove]'),
};

export default definition;
export const component = create(definition);
