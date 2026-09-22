import { clickable, collection, create } from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';
import userStatus from 'ilios-common/page-objects/components/user-status';

const definition = {
  scope: '[data-test-user-list]',
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
