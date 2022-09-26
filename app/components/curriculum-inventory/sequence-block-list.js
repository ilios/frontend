import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class SequenceBlockListComponent extends Component {
  @service store;

  @tracked editorOn = false;
  @tracked savedBlock;

  get isInOrderedSequence() {
    return this.args.parent && this.args.parent.isOrdered;
  }

  @action
  toggleEditor() {
    this.editorOn = !this.editorOn;
    this.savedBlock = null;
  }

  @action
  cancel() {
    this.editorOn = false;
  }

  save = dropTask(async (block) => {
    this.editorOn = false;
    this.savedBlock = await block.save();
    // adding/updating a sequence block will have side-effects on its siblings if the given block is nested
    // inside an "ordered" sequence block. they all get re-sorted server-side.
    // therefore, we must reload them here in order to get those updated sort order values.
    // [ST 2021/03/16]
    if (this.args.parent) {
      await this.store.findRecord('curriculum_inventory_sequence_block', this.args.parent.id, {
        include: 'children',
        reload: true,
      });
    }
  });
}
