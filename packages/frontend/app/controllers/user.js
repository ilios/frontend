import Controller from '@ember/controller';
import { service } from '@ember/service';
import { filter } from 'rsvp';
import { cached, tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { TrackedAsyncData } from 'ember-async-data';

export default class UserController extends Controller {
  @service store;
  @service permissionChecker;
  @service iliosConfig;

  queryParams = [
    'isManagingBio',
    'isManagingRoles',
    'isManagingCohorts',
    'isManagingIcs',
    'isManagingSchools',
    'permissionsSchool',
    'permissionsYear',
  ];
  @tracked isManagingBio = false;
  @tracked isManagingRoles = false;
  @tracked isManagingCohorts = false;
  @tracked isManagingIcs = false;
  @tracked isManagingSchools = false;
  @tracked permissionsSchool = null;
  @tracked permissionsYear = null;

  @use canCreate = new AsyncProcess(() => [this.canCreateInSomeSchool.bind(this), this.allSchools]);

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
    const schoolsWithCreateUserPermission = await filter(schools.slice(), async (school) => {
      return this.permissionChecker.canCreateUser(school);
    });
    return schoolsWithCreateUserPermission.length > 0;
  }
}
