import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';
import onResize from 'ember-on-resize-modifier/modifiers/on-resize';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import { hash } from '@ember/helper';

export default class FadeTextComponent extends Component {
  @tracked textHeight;
  @tracked expanded;

  MAX_HEIGHT = 200;

  get displayText() {
    return new htmlSafe(this.args.text);
  }

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
      {{#if (has-block)}}
        {{yield
          (hash
            controls=(component
              Controls
              expandable=this.shouldFade
              collapsible=this.isExpanded
              expand=this.expand
              collapse=this.collapse
            )
            text=(component
              FadedText faded=this.shouldFade resize=this.updateTextDims text=this.displayText
            )
          )
        }}
      {{else}}
        <FadedText
          @faded={{this.shouldFade}}
          @resize={{this.updateTextDims}}
          @text={{this.displayText}}
        />
        <Controls
          @expandable={{this.shouldFade}}
          @collapsible={{this.isExpanded}}
          @expand={{this.expand}}
          @collapse={{this.collapse}}
        />
      {{/if}}
    </span>
  </template>
}

const Controls = <template>
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
</template>;

const FadedText = <template>
  <div class="display-text-wrapper{{if @faded ' faded'}}">
    <div class="display-text" {{onResize @resize}}>
      {{@text}}
    </div>
  </div>
</template>;
