import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

export default class SelectableTermsListItem extends Component {
  @tracked isHovering;

  get selectableTermsListItemButtonId() {
    return `selectable-terms-list-item-button-${guidFor(this)}`;
  }

  get selectableTermsListItemButtonElement() {
    return document.getElementById(this.selectableTermsListItemButtonId);
  }

  get isSelected() {
    const term = this.args.term;
    const selectedTerms = this.args.selectedTerms;
    return selectedTerms.includes(term);
  }

  get level() {
    return this.args.level ?? 0;
  }

  get showTooltip() {
    return this.args?.term.description?.length && this.isHovering;
  }

  @action
  click() {
    if (this.isSelected) {
      this.args.remove(this.args.term);
    } else {
      this.args.add(this.args.term);
    }
  }
}
