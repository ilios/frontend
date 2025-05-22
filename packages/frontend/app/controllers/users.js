import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class UsersController extends Controller {
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
  sortBy = 'fullName';
  offset = 0;
  limit = 25;
  query = null;
  showNewUserForm = false;
  showBulkNewUserForm = false;
  searchTerms = null;

  @action
  transitionToUser(userId) {
    this.router.transitionTo('user', userId);
  }
}
