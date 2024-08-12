import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { typeOf } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { action } from '@ember/object';

export default class FadeTextComponent extends Component {
  @tracked expanded = false;

  get length() {
    return this.args.length ?? 200;
  }
  get slippage() {
    return this.args.slippage ?? 25;
  }
  get text() {
    if (!this.args.text) {
      return '';
    }
    if (typeOf(this.args.text) !== 'string') {
      return this.args.text.toString();
    }

    return this.args.text;
  }
  get totalLength() {
    return this.length + this.slippage;
  }
  get isFaded() {
    return this.displayText.toString() !== this.text;
  }
  get displayText() {
    if (this.expanded || this.text.length < this.totalLength) {
      return new htmlSafe(this.text);
    }
    const fadedText = this.text.substring(0, this.length);
    return new htmlSafe(fadedText);
  }

  @action
  expand() {
    this.expanded = true;
  }

  @action
  collapse() {
    this.expanded = false;
  }
}
