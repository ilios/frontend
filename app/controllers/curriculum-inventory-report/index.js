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
  @tracked isFinalized = this.model.belongsTo('export').id();
  @use _sequenceBlocks = new ResolveAsyncValue(() => [this.model.sequenceBlocks]);

  get canUpdate() {
    return this.hasUpdatePermissions && !this.isFinalized;
  }

  get topLevelSequenceBlocks() {
    if (!this._sequenceBlocks) {
      return [];
    }
    return this._sequenceBlocks.toArray().filter((block) => !block.belongsTo('parent').id());
  }

  @action
  async removeSequenceBlock(block) {
    await block.destroyRecord();
    this.model.reload();
  }
}
