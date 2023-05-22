import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import PermissionChecker from 'ilios/classes/permission-checker';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class LearnerGroupController extends Controller {
  @service permissionChecker;

  queryParams = [{ isEditing: 'edit' }, { isBulkAssigning: 'bulkupload', sortUsersBy: 'usersBy' }];

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.model.school);
  }

  get school() {
    return this.schoolData.isResolved ? this.schoolData.value : null;
  }

  @use canUpdate = new PermissionChecker(() => ['canUpdateLearnerGroup', this.model]);
  @use canDelete = new PermissionChecker(() => ['canDeleteLearnerGroup', this.model]);

  @cached
  get canCreateData() {
    return new TrackedAsyncData(
      this.school ? this.permissionChecker.canCreateLearnerGroup(this.school) : false
    );
  }

  get canCreate() {
    return this.canCreateData.isResolved ? this.canCreateData.value : null;
  }

  @tracked isEditing = false;
  @tracked isBulkAssigning = false;
  @tracked sortUsersBy = 'fullName';
}
