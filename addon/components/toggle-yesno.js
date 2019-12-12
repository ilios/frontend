import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ToggleYesno extends Component {

  get yes() {
    return !!this.args.yes;
  }

  @action
  click(){
    this.args.toggle(! this.yes);
  }
}
