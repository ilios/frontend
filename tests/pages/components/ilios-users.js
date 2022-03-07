import { clickable, create, fillable, value } from 'ember-cli-page-object';
import newUserForm from 'ilios/tests/pages/components/new-user';
import userList from 'ilios/tests/pages/components/user-list';
import pagedlistControls from 'ilios-common/page-objects/components/pagedlist-controls';

const definition = {
  scope: '[data-test-ilios-users]',
  title: {
    scope: '[data-test-title]',
  },
  search: {
    scope: '[data-test-filters]',
    set: fillable('input'),
    value: value('input'),
  },
  collapseForm: clickable('[data-test-collapse]'),
  showNewUserFormButton: {
    scope: '[data-test-show-new-user-form]',
  },
  showBulkUsersFormButton: {
    scope: '[data-test-show-bulk-new-user-form]',
  },
  newUserForm,
  // @todo replace with page object. [ST 2020/12/02]
  newDirectoryUserForm: {
    scope: '.new-directory-user',
    cancel: clickable('.buttons button.cancel'),
  },
  // @todo replace with page object. [ST 2020/12/02]
  newBulkUserForm: {
    scope: '.bulk-new-users',
    cancel: clickable('.buttons button.cancel'),
  },
  topPaginator: {
    scope: '[data-test-top-paged-list-controls',
    pagedlistControls,
  },
  userList,
  noUsers: {
    scope: '[data-test-no-users]',
  },
  bottomPaginator: {
    scope: '[data-test-bottom-paged-list-controls',
    pagedlistControls,
  },
};

export default definition;
export const component = create(definition);
