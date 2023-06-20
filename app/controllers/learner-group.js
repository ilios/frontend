import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import PermissionChecker from 'ilios-common/classes/permission-checker';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class LearnerGroupController extends Controller {
  @service permissionChecker;
  queryParams = [{ isEditing: 'edit' }, { isBulkAssigning: 'bulkupload', sortUsersBy: 'usersBy' }];

  @tracked isEditing = false;
  @tracked isBulkAssigning = false;
  @tracked sortUsersBy = 'fullName';

  @use canUpdate = new PermissionChecker(() => ['canUpdateLearnerGroup', this.model]);
  @use canDelete = new PermissionChecker(() => ['canDeleteLearnerGroup', this.model]);

  @cached
  get canCreateData() {
    return new TrackedAsyncData(this.checkCanCreate(this.model));
  }

  get canCreate() {
    return this.canCreateData.isResolved ? this.canCreateData.value : false;
  }

  async checkCanCreate(learnerGroup) {
    const cohort = await learnerGroup.cohort;
    const programYear = await cohort.programYear;
    const program = await programYear.program;
    const school = await program.school;

    return await this.permissionChecker.canCreateLearnerGroup(school);
  }
}
