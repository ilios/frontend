import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { typeOf } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { action } from '@ember/object';

export default class FadeTextComponent extends Component {
  @tracked textHeight;

  MAX_HEIGHT = 200;

  get text() {
    if (!this.args.text) {
      return '';
    }
    if (typeOf(this.args.text) !== 'string') {
      return this.args.text.toString();
    }

    return this.args.text;
  }
  get displayText() {
    return new htmlSafe(this.text);
  }

  get textHeightRounded() {
    return Math.floor(this.textHeight);
  }

  get isFaded() {
    if (!this.expanded !== undefined) {
      if (this.expanded) {
        return false;
      } else {
        return this.exceedsHeight;
      }
    } else {
      return this.exceedsHeight;
    }
  }

  get exceedsHeight() {
    return this.textHeightRounded >= this.MAX_HEIGHT;
  }

  get expanded() {
    return this.args.expanded;
  }

  @action
  expand(event) {
    event.stopPropagation();
    this.args.onExpandAll(true);
  }

  @action
  collapse(event) {
    event.stopPropagation();
    this.args.onExpandAll(false);
  }

  @action
  updateTextDims({ contentRect: { height } }) {
    this.textHeight = height;
  }
}
