import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { guidFor } from '@ember/object/internals';

export default class DetailTermsListItem extends Component {
  @tracked isHovering;

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

  get detailTermsListItemId() {
    return `detail-terms-list-item-${guidFor(this)}`;
  }

  get detailTermsListItemElement() {
    return document.getElementById(this.detailTermsListItemId);
  }

  get showTooltip() {
    return this.args?.term.description?.length && this.isHovering;
  }

  get isTopLevel() {
    if (undefined === this.parent) {
      return false;
    }
    return !this.parent;
  }
}
