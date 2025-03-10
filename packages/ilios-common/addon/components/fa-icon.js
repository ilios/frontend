import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class FaIconComponent extends Component {
  get uniqueId() {
    return guidFor(this);
  }

  get ariaLabeledBy() {
    return this.args.ariaLabeledBy ?? this.titleId;
  }

  get titleId() {
    if (!this.args.title) {
      return null;
    }

    return `inline-title-${this.uniqueId}`;
  }

  get ariaHidden() {
    return this.args.title || this.args.ariaLabeledBy ? 'false' : 'true';
  }

  get focusable() {
    return this.args.title || this.args.ariaLabeledBy ? 'true' : 'false';
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

  get extraClasses() {
    let classes = [];

    if (this.args.spin) {
      classes.push('spin');
    }

    if (this.args.listItem) {
      classes.push('list-item');
    }

    if (this.args.fixedWidth) {
      classes.push('fixed-width');
    }

    if (this.flip !== '') {
      classes.push(this.flip);
    }

    return classes.length ? ` ${classes.join(' ')}` : '';
  }
}
