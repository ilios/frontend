import { collection, create, text } from 'ember-cli-page-object';
import manager from './instructor-manager';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';
import userStatus from 'ilios-common/page-objects/components/user-status';
import bigSaveCancelButtons from 'ilios-common/page-objects/components/big-save-cancel-buttons';

const definition = {
  scope: '[data-test-instructor-group-users]',
  title: text('[data-test-header] [data-test-title]'),
  manage: {
    scope: '[data-test-manage]',
  },
  bigSaveCancelButtons,
  manager,
  users: collection('[data-test-users-list] [data-test-user]', {
    userStatus,
    userNameInfo,
  }),
};

export default definition;
export const component = create(definition);
