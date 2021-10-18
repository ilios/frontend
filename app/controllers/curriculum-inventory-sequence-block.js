import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

export default class CurriculumInventorySequenceBlockController extends Controller {
  @service store;
  queryParams = ['sortSessionsBy'];
  @tracked sortSessionsBy = 'title';
  @tracked canUpdate = false;

  @use report = new ResolveAsyncValue(() => [this.model.report]);
  @use children = new ResolveAsyncValue(() => [this.model.children]);

  @action
  async removeChildSequenceBlock(block) {
    await block.destroyRecord();
    // removing a nested sequence block will have side-effects on its siblings if the given block is nested
    // inside an "ordered" sequence block. they all get re-sorted server-side.
    // therefore, we must reload them here in order to get those updated sort order values.
    // [ST 2021/03/16]
    await this.store.findRecord('curriculum_inventory_sequence_block', this.model.id, {
      include: 'children',
      reload: true,
    });
  }

  @action
  setSortSessionsBy(sortSessionsBy) {
    this.sortSessionsBy = sortSessionsBy;
  }
}
