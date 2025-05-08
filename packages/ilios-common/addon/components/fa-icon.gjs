import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import eq from 'ember-truth-helpers/helpers/eq';

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
  <template>
    {{! template-lint-disable eol-last }}
    <svg
      class="awesome-icon fa-{{@icon}}{{this.extraClasses}}"
      data-icon={{@icon}}
      aria-hidden={{this.ariaHidden}}
      focusable={{this.focusable}}
      role="img"
      fill="currentColor"
      aria-labelledby={{this.ariaLabeledBy}}
      ...attributes
    >
      {{#if @title}}
        <title id={{this.titleId}}>{{@title}}</title>
      {{/if}}

      {{#if (eq @prefix "brands")}}
        <use xlink:href="/fontawesome/brands.svg#{{@icon}}"></use>
      {{else if (eq @prefix "regular")}}
        <use xlink:href="/fontawesome/regular.svg#{{@icon}}"></use>
      {{else}}
        <use xlink:href="/fontawesome/solid.svg#{{@icon}}"></use>
      {{/if}}
    </svg>
  </template>
}
