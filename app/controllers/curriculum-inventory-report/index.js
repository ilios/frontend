import Controller from '@ember/controller';
import { action } from '@ember/object';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class CurriculumInventoryReportIndexController extends Controller {
  @use topLevelSequenceBlocks = new ResolveAsyncValue(() => [this.model.topLevelSequenceBlocks]);

  @action
  async removeSequenceBlock(block) {
    await block.destroyRecord();
    this.model.reload();
  }
}
