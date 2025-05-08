import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { typeOf } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { action } from '@ember/object';
import EllipsisIcon from 'ilios-common/components/ellipsis-icon';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';

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

  @action
  collapse() {
    this.expanded = false;
  }
  <template>
    {{#if (has-block)}}
      {{yield this.displayText this.expand this.collapse this.isTruncated this.expanded}}
    {{else}}
      <span class="truncate-text" data-test-truncate-text ...attributes>
        {{this.displayText}}
        {{#if this.isTruncated}}
          <EllipsisIcon />
          <button
            class="expand-buttons"
            aria-label={{t "general.expand"}}
            title={{t "general.expand"}}
            type="button"
            data-test-expand
            {{on "click" this.expand}}
          >
            <FaIcon @icon="angles-down" />
          </button>
        {{else}}
          {{#if this.expanded}}
            <button
              class="expand-buttons"
              aria-label={{t "general.collapse"}}
              title={{t "general.collapse"}}
              type="button"
              data-test-collapse
              {{on "click" this.collapse}}
            >
              <FaIcon @icon="angles-up" />
            </button>
          {{/if}}
        {{/if}}
      </span>
    {{/if}}
  </template>
}
