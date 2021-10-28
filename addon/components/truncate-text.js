import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { typeOf } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { action } from '@ember/object';

export default class TruncateTextComponent extends Component {
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
  get cleanText() {
    return this.text.replace(/(<([^>]+)>)/gi, '');
  }
  get totalLength() {
    return this.length + this.slippage;
  }
  get displayText() {
    if (this.expanded || this.cleanText.length < this.totalLength) {
      if (this.args.renderHtml) {
        return new htmlSafe(this.text);
      } else {
        return new htmlSafe(this.cleanText);
      }
    }
    const truncatedText = this.cleanText.substring(0, this.length);
    return new htmlSafe(truncatedText);
  }
  get isTruncated() {
    if (this.args.renderHtml) {
      return this.displayText.toString() !== this.text;
    } else {
      return this.displayText.toString() !== this.cleanText;
    }
  }
  @action
  expand() {
    this.expanded = true;
  }
}
