import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import onResize from 'ember-on-resize-modifier/modifiers/on-resize';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';

export default class FadeTextComponent extends Component {
  @tracked textHeight;
  @tracked expanded;

  MAX_HEIGHT = 200;

  get textHeightRounded() {
    return Math.floor(this.textHeight);
  }

  get exceedsHeight() {
    return this.textHeightRounded >= this.MAX_HEIGHT;
  }

  get shouldFade() {
    if (this.args.forceExpanded || this.expanded) {
      return false;
    }

    return this.exceedsHeight;
  }

  get isExpanded() {
    return (this.expanded || this.args.forceExpanded) && this.exceedsHeight;
  }

  expand = () => {
    this.expanded = true;
    if (this.args.setExpanded) {
      this.args.setExpanded(true);
    }
  };

  collapse = () => {
    this.expanded = false;
    if (this.args.setExpanded) {
      this.args.setExpanded(false);
    }
  };

  updateTextDims = ({ contentRect: { height } }) => {
    this.textHeight = height;
  };

  <template>
    <span class="fade-text" data-test-fade-text ...attributes>
      <div class="display-text-wrapper{{if this.shouldFade ' faded'}}" data-test-display-text>
        <div class="display-text" {{onResize this.updateTextDims}} data-test-text>
          {{! template-lint-disable no-triple-curlies }}
          {{{@text}}}
        </div>
      </div>
      <Controls
        @expandable={{this.shouldFade}}
        @collapsible={{this.isExpanded}}
        @expand={{this.expand}}
        @collapse={{this.collapse}}
      >
        {{#if (has-block "additionalControls")}}
          {{yield to="additionalControls"}}
        {{/if}}
      </Controls>
    </span>
  </template>
}

const Controls = <template>
  <div data-test-fade-text-controls>
    {{yield}}
    {{#if @expandable}}
      <button
        class="expand-text-button"
        title={{t "general.expand"}}
        type="button"
        data-test-expand
        data-test-fade-text-control
        {{on "click" @expand}}
      >
        <FaIcon @icon="angles-down" />
      </button>
    {{else}}
      {{#if @collapsible}}
        <button
          class="collapse-text-button"
          title={{t "general.collapse"}}
          type="button"
          data-test-collapse
          data-test-fade-text-control
          {{on "click" @collapse}}
        >
          <FaIcon @icon="angles-up" />
        </button>
      {{/if}}
    {{/if}}
  </div>
</template>;
