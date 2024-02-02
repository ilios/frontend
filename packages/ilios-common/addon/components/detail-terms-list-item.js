import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class DetailTermsListItem extends Component {
  @tracked isHovering;
  @tracked theElement;

  @use allParentTitles = new AsyncProcess(() => [
    this.args.term.getAllParentTitles.bind(this.args.term),
  ]);

  @cached
  get parentData() {
    return new TrackedAsyncData(this.args.term.parent);
  }

  get parent() {
    return this.parentData.isResolved ? this.parentData.value : null;
  }

  get showTooltip() {
    return this.args?.term.description?.length && this.theElement && this.isHovering;
  }

  get isTopLevel() {
    if (undefined === this.parent) {
      return false;
    }
    return !this.parent;
  }
}
