import Controller from '@ember/controller';
import { service } from '@ember/service';
import { filter } from 'rsvp';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class UserController extends Controller {
  @service store;
  @service permissionChecker;
  @service iliosConfig;

  queryParams = [
    'showCalendar',
    'isManagingBio',
    'isManagingRoles',
    'isManagingCohorts',
    'isManagingIcs',
    'isManagingSchools',
    'permissionsSchool',
    'permissionsYear',
  ];
  @tracked showCalendar = false;
  @tracked isManagingBio = false;
  @tracked isManagingRoles = false;
  @tracked isManagingCohorts = false;
  @tracked isManagingIcs = false;
  @tracked isManagingSchools = false;
  @tracked permissionsSchool = null;
  @tracked permissionsYear = null;

  @cached
  get canCreateData() {
    return new TrackedAsyncData(this.canCreateInSomeSchool(this.allSchools));
  }

  get canCreate() {
    return this.canCreateData.isResolved ? this.canCreateData.value : false;
  }

  @cached
  get canUpdateData() {
    return new TrackedAsyncData(this.permissionChecker.canUpdateUser(this.model));
  }

  get canUpdate() {
    return this.canUpdateData.isResolved ? this.canUpdateData.value : false;
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
}
