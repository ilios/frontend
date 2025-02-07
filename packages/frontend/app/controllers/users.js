import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { filter } from 'rsvp';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

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
  sortBy = 'fullName';
  offset = 0;
  limit = 25;
  query = null;
  showNewUserForm = false;
  showBulkNewUserForm = false;
  searchTerms = null;

  @cached
  get canCreateData() {
    return new TrackedAsyncData(this.canCreateInSomeSchool(this.allSchools));
  }

  get canCreate() {
    return this.canCreateData.isResolved ? this.canCreateData.value : false;
  }

  @cached
  get allSchoolsData() {
    return new TrackedAsyncData(this.store.findAll('school'));
  }

  get allSchools() {
    return this.allSchoolsData.isResolved ? this.allSchoolsData.value : [];
  }

  async canCreateInSomeSchool(schools) {
    if (!schools) {
      return false;
    }
    const schoolsWithCreateUserPermission = await filter(schools, async (school) => {
      return this.permissionChecker.canCreateUser(school);
    });
    return schoolsWithCreateUserPermission.length > 0;
  }

  @action
  transitionToUser(userId) {
    this.router.transitionTo('user', userId);
  }
}
