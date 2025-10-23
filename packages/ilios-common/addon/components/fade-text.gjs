import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';
import onResize from 'ember-on-resize-modifier/modifiers/on-resize';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import { hash } from '@ember/helper';
import { TrackedAsyncData } from 'ember-async-data';
import { buildWaiter } from '@ember/test-waiters';
import { modifier } from 'ember-modifier';

//initialize this in module scope as recomended by the docs
const fadeTextWaiter = buildWaiter('FadeTextComponent');

export default class FadeTextComponent extends Component {
  @tracked textHeight;
  @tracked expanded;
  waiter = false;

  MAX_HEIGHT = 200;

  setup = modifier(() => {
    //setup a test waiter when the component is created
    this.waiter = fadeTextWaiter.beginAsync();
  });

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

    // end and remove the waiter the first time we get a size update
    if (this.waiter) {
      fadeTextWaiter.endAsync(this.waiter);
      this.waiter = false;
    }
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
              FadedTextComponent
              faded=this.shouldFade
              resize=this.updateTextDims
              setup=this.setup
              text=@text
              preserveLinks=@preserveLinks
            )
          )
        }}
      {{else}}
        <FadedTextComponent
          @faded={{this.shouldFade}}
          @resize={{this.updateTextDims}}
          @setup={{this.setup}}
          @preserveLinks={{@preserveLinks}}
          @text={{@text}}
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

class FadedTextComponent extends Component {
  @cached
  get sanitizerData() {
    return new TrackedAsyncData(import('sanitize-html'));
  }

  get cleanText() {
    if (this.args.preserveLinks) {
      return this.args.text;
    }

    if (!this.sanitizerData.isResolved) {
      return this.args.text;
    }

    const { default: sanitizeHtml } = this.sanitizerData.value;

    return sanitizeHtml(this.args.text, {
      transformTags: {
        a: sanitizeHtml.simpleTransform('span', { class: 'link' }, false),
      },
      allowedAttributes: false, //disable attribute filtering
      allowedTags: false, //disable tag filtering
      allowVulnerableTags: true, //turn off warnings about script tags
    });
  }

  get displayText() {
    return new htmlSafe(this.cleanText);
  }

  <template>
    <div
      class="display-text-wrapper{{if @faded ' faded'}}"
      data-test-display-text
      data-test-done={{this.sanitizerData.isResolved}}
    >
      <div class="display-text" {{@setup}} {{onResize @resize}} data-test-text>
        {{this.displayText}}
      </div>
    </div>
  </template>
}
