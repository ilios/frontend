import { cached, tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';

import { findRecord } from '@ember-data/legacy-compat/builders';

export default class CurriculumInventorySequenceBlockController extends Controller {
  @service store;
  queryParams = ['sortSessionsBy'];
  @tracked sortSessionsBy = 'title';
  @tracked canUpdate = false;

  @cached
  get reportData() {
    return new TrackedAsyncData(this.model.report);
  }

  get report() {
    return this.reportData.isResolved ? this.reportData.value : null;
  }

  @cached
  get childrenData() {
    return new TrackedAsyncData(this.model.children);
  }

  get children() {
    return this.childrenData.isResolved ? this.childrenData.value : null;
  }

  @action
  async removeChildSequenceBlock(block) {
    await block.destroyRecord();
    // removing a nested sequence block will have side-effects on its siblings if the given block is nested
    // inside an "ordered" sequence block. they all get re-sorted server-side.
    // therefore, we must reload them here in order to get those updated sort order values.
    // [ST 2021/03/16]
    await this.store.request(findRecord('curriculum-inventory-sequence-block', this.model.id, {
      include: 'children',
      reload: true,
    }));
  }

  @action
  setSortSessionsBy(sortSessionsBy) {
    this.sortSessionsBy = sortSessionsBy;
  }
}
