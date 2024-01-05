import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class FaIconComponent extends Component {
  get uniqueId() {
    return guidFor(this);
  }

  get titleId() {
    if (!this.args.title) {
      return null;
    }

    return `inline-title-${this.uniqueId}`;
  }

  get ariaHidden() {
    return this.args.title ? 'false' : 'true';
  }

  get focusable() {
    return this.args.title ? 'true' : 'false';
  }

  get flip() {
    if (this.args.flip === 'horizontal') {
      return 'flip-horizontal';
    }

    if (this.args.flip === 'vertical') {
      return 'flip-vertical';
    }

    if (this.args.flip === 'both') {
      return 'flip-horizontal flip-vertical';
    }

    return '';
  }
}
