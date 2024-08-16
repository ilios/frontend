import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
export default class DetailTermsListItem extends Component {
  @tracked isHovering;
  @tracked theElement;

  @cached
  get allParentsTitlesData() {
    return new TrackedAsyncData(this.args.term.getAllParentTitles(this.args.term));
  }

  get allParentTitles() {
    return this.allParentsTitlesData.isResolved ? this.allParentsTitlesData.value : [];
  }

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
