import Component from '@glimmer/component';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import {
  faArrowDown19,
  faArrowDown91,
  faArrowDownAZ,
  faArrowDownZA,
  faSort,
} from '@fortawesome/free-solid-svg-icons';

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

  get textDirection() {
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
        return this.sortType === 'numeric' ? faArrowDown19 : faArrowDownAZ;
      } else {
        return this.sortType === 'numeric' ? faArrowDown91 : faArrowDownZA;
      }
    } else {
      return faSort;
    }
  }

  @action
  click() {
    if (this.args.onClick) {
      this.args.onClick();
    }
  }
  <template>
    <button
      type="button"
      class="sortable-heading sortable text-{{this.align}}
        {{if this.hideFromSmallScreen 'hide-from-small-screen'}}"
      colspan={{this.colspan}}
      title={{this.title}}
      {{on "click" this.click}}
      ...attributes
    >
      {{yield}}<FaIcon @icon={{this.sortIcon}} />
    </button>
  </template>
}
