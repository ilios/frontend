import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import PermissionChecker from 'ilios/classes/permission-checker';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { inject as service } from '@ember/service';

export default class LearnerGroupController extends Controller {
  @service permissionChecker;

  queryParams = [{ isEditing: 'edit' }, { isBulkAssigning: 'bulkupload', sortUsersBy: 'usersBy' }];
  @use school = new ResolveAsyncValue(() => [this.model.school]);
  @use canUpdate = new PermissionChecker(() => ['canUpdateLearnerGroup', this.model]);
  @use canDelete = new PermissionChecker(() => ['canDeleteLearnerGroup', this.model]);
  @use canCreate = new ResolveAsyncValue(() => [
    this.school ? this.permissionChecker.canCreateLearnerGroup(this.school) : false,
  ]);

  @tracked isEditing = false;
  @tracked isBulkAssigning = false;
  @tracked sortUsersBy = 'fullName';
}
