import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class UsersController extends Controller {
  @service store;
  @service router;

  queryParams = [
    {
      sortBy: 'sortBy',
      offset: 'offset',
      limit: 'limit',
      query: 'filter',
      showNewUserForm: 'addUser',
      showBulkNewUserForm: 'addUsers',
      searchTerms: 'search',
    },
  ];
  @tracked sortBy = 'fullName';
  @tracked offset = 0;
  @tracked limit = 25;
  @tracked query = null;
  @tracked showNewUserForm = false;
  @tracked showBulkNewUserForm = false;
  @tracked searchTerms = null;

  @action
  transitionToUser(userId) {
    this.router.transitionTo('user', userId);
  }
}
