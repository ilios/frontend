import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class CurriculumInventoryReportIndexController extends Controller {
  queryParams = ['leadershipDetails', 'manageLeadership'];
  @tracked hasUpdatePermissions = false;
  @tracked leadershipDetails = false;
  @tracked manageLeadership = false;
  @tracked isFinalized = this.model.belongsTo('export').id();

  @cached
  get _sequenceBlocksData() {
    return new TrackedAsyncData(this.model.sequenceBlocks);
  }

  get _sequenceBlocks() {
    return this._sequenceBlocksData.isResolved ? this._sequenceBlocksData.value : null;
  }

  get canUpdate() {
    return this.hasUpdatePermissions && !this.isFinalized;
  }

  get topLevelSequenceBlocks() {
    if (!this._sequenceBlocks) {
      return [];
    }
    return this._sequenceBlocks.slice().filter((block) => !block.belongsTo('parent').id());
  }

  @action
  async removeSequenceBlock(block) {
    await block.destroyRecord();
    this.model.reload();
  }
}
