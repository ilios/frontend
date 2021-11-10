import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class CurriculumInventoryReportIndexController extends Controller {
  queryParams = ['leadershipDetails', 'manageLeadership'];
  @tracked hasUpdatePermissions = false;
  @tracked leadershipDetails = false;
  @tracked manageLeadership = false;
  @tracked isFinalized = true;
  @use topLevelSequenceBlocks = new ResolveAsyncValue(() => [this.model.topLevelSequenceBlocks]);

  get canUpdate() {
    return this.hasUpdatePermissions && !this.isFinalized;
  }

  @action
  setLeadershipDetails(leadershipDetails) {
    this.leadershipDetails = leadershipDetails;
  }

  @action
  setManageLeadership(manageLeadership) {
    this.manageLeadership = manageLeadership;
  }

  @action
  async removeSequenceBlock(block) {
    await block.destroyRecord();
    this.model.reload();
  }
}
