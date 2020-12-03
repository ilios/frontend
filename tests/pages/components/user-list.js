import { collection, create, hasClass } from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

const definition = {
  scope: '[data-test-user-list]',
  users: collection('[data-test-user]', {
    isDisabled: hasClass('disabled-user-account'),
    disabledUserIcon: {
      scope: '[data-test-disabled-user-icon]'
    },
    userNameInfo,
    campusId: {
      scope: '[data-test-campus-id]',
    },
    email: {
      scope: '[data-test-email]',
    },
    school: {
      scope: '[data-test-school]',
    }
  })
};

export default definition;
export const component = create(definition);
