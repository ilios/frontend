import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class LearnerGroupController extends Controller {
  @service permissionChecker;
  queryParams = [{ isEditing: 'edit' }, { isBulkAssigning: 'bulkupload', sortUsersBy: 'usersBy' }];

  @tracked isEditing = false;
  @tracked isBulkAssigning = false;
  @tracked sortUsersBy = 'fullName';

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(this.permissionChecker.canDeleteLearnerGroup(this.model));
  }

  get canDelete() {
    return this.canDeleteData.isResolved ? this.canDeleteData.value : false;
  }

  @cached
  get canUpdateData() {
    return new TrackedAsyncData(this.permissionChecker.canUpdateLearnerGroup(this.model));
  }

  get canUpdate() {
    return this.canUpdateData.isResolved ? this.canUpdateData.value : false;
  }

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
