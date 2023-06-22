import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { filter } from 'rsvp';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import PermissionChecker from 'ilios-common/classes/permission-checker';

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

  @use canUpdate = new PermissionChecker(() => ['canUpdateUser', this.model]);
  @use canCreate = new AsyncProcess(() => [this.canCreateInSomeSchool.bind(this), this.allSchools]);

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
