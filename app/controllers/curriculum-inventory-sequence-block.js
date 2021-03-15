import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { all } from 'rsvp';

export default class CurriculumInventorySequenceBlockController extends Controller {
  queryParams = ['sortSessionsBy'];
  @tracked sortSessionsBy = 'title';
  @tracked canUpdate = false;

  @action
  async removeChildSequenceBlock(block) {
    await block.destroyRecord();
    // @todo is all of this below still necessary? [ST 2021/03/15]
    await this.model.reload();
    const children = await this.model.children;
    await all(children.invoke('reload'));
  }
}
