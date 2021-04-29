import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class CurriculumInventoryReportIndexController extends Controller {
  @action
  async removeSequenceBlock(block) {
    await block.destroyRecord();
    this.model.reload();
  }
}
