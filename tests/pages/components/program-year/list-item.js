import {
  create,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-program-year-list-item]',
  link: {
    scope: '[data-test-link]',
  },
  title: text('[data-test-title]'),
};

export default definition;
export const component = create(definition);
