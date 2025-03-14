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
      if (typeOf(this.args.text) === 'array') {
        let text = '<ul>';
        text += this.args.text.map((elem) => `<li>${elem}</li>`).join('');
        text += '</ul>';
        return text;
      }
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

  get exceedsHeight() {
    return this.textHeightRounded >= this.MAX_HEIGHT;
  }

  get shouldFade() {
    if (this.expanded !== undefined) {
      return this.expanded ? false : this.exceedsHeight;
    }

    return this.exceedsHeight;
  }

  get expanded() {
    return this.args.expanded && this.exceedsHeight;
  }

  @action
  expand(event) {
    if (event) {
      event.stopPropagation();
    }
    this.args.onExpandAll(true);
  }

  @action
  collapse(event) {
    if (event) {
      event.stopPropagation();
    }
    this.args.onExpandAll(false);
  }

  @action
  updateTextDims({ contentRect: { height } }) {
    this.textHeight = height;
  }
}
