import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

export default class ToggleIcons extends Component {

  get uniqueId() {
    return guidFor(this);
  }

  @action
  firstChoice(){
    if (! this.args.firstOptionSelected) {
      this.args.toggle(true);
    }
  }

  @action
  secondChoice(){
    if (this.args.firstOptionSelected) {
      this.args.toggle(false);
    }
  }
}
