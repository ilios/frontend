import { clickable, collection, create, fillable, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-manage-users-summary]',
  visitUsers: clickable('[data-test-users-link]'),
  createNewUser: clickable('[data-test-create-user-link]'),
  userSearch: {
    scope: '[data-test-user-search]',
    input: fillable('input'),
    results: collection('[data-test-results] li', {
      click: clickable('button'),
      name: text('[data-test-name]'),
      email: text('[data-test-email]'),
    }),
    summary: text('[data-test-summary]'),
  },
};

export default definition;
export const component = create(definition);
