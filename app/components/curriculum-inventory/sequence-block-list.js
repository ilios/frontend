import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { use } from 'ember-could-get-used-to-this';
import { Task } from 'ember-resource-tasks';
import { all, map } from 'rsvp';

export default class SequenceBlockListComponent extends Component {
  @tracked editorOn = false;
  @tracked savedBlock;

  @use sortedBlocks = new Task(() => {
    return {
      named: {
        args: [this.isInOrderedSequence, this.args.sequenceBlocks, this.args.sequenceBlocks.length],
        fn: this.sort,
      },
    };
  });

  get isInOrderedSequence() {
    return this.args.parent && this.args.parent.isOrdered;
  }

  get sequenceBlocks() {
    if (!this.sortedBlocks.value) {
      return [];
    }
    return this.sortedBlocks.value;
  }

  @action
  async sort(isOrderedInSequence, sequenceBlocks /* ,sequenceBlocksLength */) {
    if (!sequenceBlocks) {
      return [];
    }
    const blocks = sequenceBlocks.toArray();

    if (isOrderedInSequence) {
      blocks.sort(this.sortOrdered);
      return blocks;
    }

    const proxies = await map(blocks, async (block) => {
      const academicLevel = await block.academicLevel;
      const level = academicLevel.level;
      return {
        level,
        block,
      };
    });
    proxies.sort(this.sortUnordered);
    return proxies.map((proxy) => {
      return proxy.block;
    });
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

  @dropTask
  *save(block) {
    this.editorOn = false;
    this.savedBlock = yield block.save();
    // adding/updating a sequence block will have side-effects on its siblings if the given block is nested
    // inside an "ordered" sequence block. they all get re-sorted server-side.
    // therefore, we must reload them here in order to get those updated sort order values.
    // [ST 2021/03/16]
    if (this.args.parent) {
      const blocks = yield this.args.parent.children;
      yield all(blocks.invoke('reload'));
    }
  }

  sortUnordered(a, b) {
    // Sort in the following order:
    // 1. sequenceBlock.academicLevel.level, ascending
    // 2. sequenceBlock.title, ascending
    // 3. sequenceBlock.startDate, ascending
    // 4. sequenceBlock.id, ascending
    // We're working with proxy objects here,
    // so sequenceBlock.academicLevel.level is mapped to proxy.level,
    // and sequenceBlock is mapped to proxy.block.
    if (a.level > b.level) {
      return 1;
    } else if (a.level < b.level) {
      return -1;
    }

    const titleComparison = a.block.title.localeCompare(b.block.title);
    if (0 !== titleComparison) {
      return titleComparison;
    }

    if (a.block.startDate > b.block.startDate) {
      return 1;
    } else if (a.block.startDate < b.block.startDate) {
      return -1;
    }

    if (a.block.id > b.block.id) {
      return 1;
    } else if (a.block.id < b.block.id) {
      return -1;
    }

    return 0;
  }

  sortOrdered(a, b) {
    // sort in the following order:
    // 1. sequenceBlock.orderInSequence, ascending
    // 2. sequenceBlock.title, ascending
    // 3. sequenceBlock.id, ascending
    if (a.orderInSequence > b.orderInSequence) {
      return 1;
    } else if (a.orderInSequence < b.orderInSequence) {
      return -1;
    }

    const titleComparison = a.title.localeCompare(b.title);
    if (0 !== titleComparison) {
      return titleComparison;
    }

    if (a.id > b.id) {
      return 1;
    } else if (a.id < b.id) {
      return -1;
    }

    return 0;
  }
}
