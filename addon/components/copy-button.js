import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class CopyButtonComponent extends Component {
  @action
  copy() {
    navigator.clipboard.writeText(this.args.clipboardText);
    if (this.args.success) {
      this.args.success();
    }
  }
}
