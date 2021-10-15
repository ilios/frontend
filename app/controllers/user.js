import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { filter } from 'rsvp';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import PermissionChecker from 'ilios/classes/permission-checker';

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
  @use allSchools = new ResolveAsyncValue(() => [this.store.findAll('school'), []]);

  async canCreateInSomeSchool(schools) {
    const schoolsWithCreateUserPermission = await filter(schools.toArray(), async (school) => {
      return this.permissionChecker.canCreateUser(school);
    });
    return schoolsWithCreateUserPermission.length > 0;
  }
}
