import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { typeOf } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { action } from '@ember/object';
import onResize from 'ember-on-resize-modifier/modifiers/on-resize';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';

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
    // short-circuit fading if no tracked property passed (i.e. doesn't make sense to use it)
    if (!this.args.expanded) {
      return false;
    }
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
    // short-circuit fading if no method passed (i.e. doesn't make sense to use it)
    if (!this.args.onExpandAll) {
      return false;
    }
    if (event) {
      event.stopPropagation();
    }
    this.args.onExpandAll(false);
  }

  @action
  updateTextDims({ contentRect: { height } }) {
    this.textHeight = height;
  }
  <template>
    {{#if (has-block)}}
      <span class="fade-text" data-test-fade-text ...attributes>
        {{yield
          this.displayText
          this.expand
          this.collapse
          this.updateTextDims
          this.shouldFade
          this.expanded
        }}
      </span>
    {{else}}
      <span class="fade-text" data-test-fade-text ...attributes>
        <div class="display-text-wrapper{{if this.shouldFade ' faded'}}">
          <div class="display-text" {{onResize this.updateTextDims}}>
            {{this.displayText}}
          </div>
        </div>
        {{#if this.shouldFade}}
          <div class="fade-text-control" data-test-fade-text-control>
            <button
              class="expand-text-button"
              aria-label={{t "general.expand"}}
              title={{t "general.expand"}}
              type="button"
              data-test-expand
              {{on "click" this.expand}}
            >
              <FaIcon @icon="angles-down" />
            </button>
          </div>
        {{else}}
          {{#if this.expanded}}
            <button
              class="expand-text-button"
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
