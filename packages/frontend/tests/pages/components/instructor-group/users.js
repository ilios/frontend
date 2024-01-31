import { collection, create, text } from 'ember-cli-page-object';
import manager from './instructor-manager';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

const definition = {
  scope: '[data-test-instructor-group-users]',
  title: text('[data-test-header] [data-test-title]'),
  manage: {
    scope: '[data-test-manage]',
  },
  save: {
    scope: '[data-test-save]',
  },
  cancel: {
    scope: '[data-test-cancel]',
  },
  manager,
  users: collection('[data-test-users-list] [data-test-user]', {
    userNameInfo,
  }),
};

export default definition;
export const component = create(definition);
