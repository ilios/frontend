import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class SortableHeading extends Component {
  get align() {
    return this.args.align || 'left';
  }

  get sortType() {
    return this.args.sortType || 'alpha';
  }

  get sortedAscending() {
    return this.args.sortedAscending || true;
  }

  get sortedBy() {
    return this.args.sortedBy || false;
  }

  get textDirection(){
    return 'text-' + this.align;
  }

  get title() {
    return this.args.title || '';
  }

  get hideFromSmallScreen() {
    return this.args.hideFromSmallScreen || false;
  }

  get sortIcon() {
    if (this.sortedBy) {
      if (this.sortedAscending) {
        return this.sortType === 'numeric' ? 'sort-numeric-down' : 'sort-alpha-down';
      } else {
        return this.sortType === 'numeric' ? 'sort-numeric-down-alt' : 'sort-alpha-down-alt';
      }
    } else {
      return 'sort';
    }
  }

  @action
  click() {
    if (this.args.click) {
      this.args.click();
    }
  }
}
