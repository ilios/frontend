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
    // removing a nested sequence block will have side-effects on its siblings if the given block is nested
    // inside an "ordered" sequence block. they all get re-sorted server-side.
    // therefore, we must reload them here in order to get those updated sort order values.
    // [ST 2021/03/16]
    const children = await this.model.children;
    await all(children.invoke('reload'));
  }
}
