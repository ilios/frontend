import { clickable, collection, create } from 'ember-cli-page-object';
import userNameInfo from 'frontend/tests/pages/components/user-name-info';
import userStatus from 'frontend/tests/pages/components/user-status';

const definition = {
  scope: '[data-test-user-list]',
  header: {
    scope: '[data-test-user-list-header]',
    name: {
      scope: '[data-test-name]',
      toggle: clickable('button'),
    },
    campusId: {
      scope: '[data-test-campus-id]',
      toggle: clickable('button'),
    },
    email: {
      scope: '[data-test-email]',
      toggle: clickable('button'),
    },
    school: {
      scope: '[data-test-school]',
    },
  },
  users: collection('[data-test-user]', {
    viewUserDetails: clickable('[data-test-user-link]'),
    userStatus,
    userNameInfo,
    campusId: {
      scope: '[data-test-campus-id]',
    },
    email: {
      scope: '[data-test-email]',
    },
    school: {
      scope: '[data-test-school]',
    },
  }),
};

export default definition;
export const component = create(definition);
