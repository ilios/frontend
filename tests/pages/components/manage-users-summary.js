import { clickable, create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-manage-users-summary]',
  visitUsers: clickable('[data-test-users-link]'),
  createNewUser: clickable('[data-test-create-user-link]'),
};

export default definition;
export const component = create(definition);
