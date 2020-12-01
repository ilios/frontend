import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class UsersController extends Controller {
  queryParams = [{
    offset: 'offset',
    limit: 'limit',
    query: 'filter',
    showNewUserForm: 'addUser',
    showBulkNewUserForm: 'addUsers',
    searchTerms: 'search',
  }];
  offset = 0;
  limit = 25;
  query = null;
  showNewUserForm = false;
  showBulkNewUserForm = false;
  searchTerms = null;

  @action
  transitionToUser(userId){
    this.transitionToRoute('user', userId);
  }
}
