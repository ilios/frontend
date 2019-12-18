import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class SelectableTermsListItem extends Component {

  get isSelected() {
    const term = this.args.term;
    const selectedTerms = this.args.selectedTerms;
    return selectedTerms.includes(term);
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
