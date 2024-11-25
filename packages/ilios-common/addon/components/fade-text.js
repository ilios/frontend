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
    if (typeOf(this.args.text) == 'array') {
      return this.args.text;
    }
    if (typeOf(this.args.text) !== 'string') {
      return this.args.text.toString();
    }

    return this.args.text;
  }
  get displayText() {
    if (typeOf(this.text) == 'array') {
      return new htmlSafe(this.text.join('<br />'));
    }
    return new htmlSafe(this.text);
  }

  get textHeightRounded() {
    return Math.floor(this.textHeight);
  }

  get shouldFade() {
    // check for global expansion flag
    if (this.expanded !== undefined) {
      // if global expansion flag is true, then element should not fade
      // otherwise, check text height to see if it should fade
      return this.expanded ? false : this.exceedsHeight;
    }
    // if no global expansion flag passed in, just check text height
    else {
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
