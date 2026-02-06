import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';
import { onResize } from 'ember-primitives/on-resize';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { hash } from '@ember/helper';
import { TrackedAsyncData } from 'ember-async-data';
import { guidFor } from '@ember/object/internals';
import { faAnglesDown, faAnglesUp } from '@fortawesome/free-solid-svg-icons';

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

  get textElementId() {
    const id = guidFor(this);

    return `text-${id}`;
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
              fadeTextId=this.textElementId
            )
            text=(component
              FadedTextComponent
              faded=this.shouldFade
              resize=this.updateTextDims
              text=@text
              preserveLinks=@preserveLinks
              id=this.textElementId
            )
          )
        }}
      {{else}}
        <FadedTextComponent
          @faded={{this.shouldFade}}
          @resize={{this.updateTextDims}}
          @preserveLinks={{@preserveLinks}}
          @text={{@text}}
          @id={{this.textElementId}}
        />
        <Controls
          @expandable={{this.shouldFade}}
          @collapsible={{this.isExpanded}}
          @expand={{this.expand}}
          @collapse={{this.collapse}}
          @fadeTextId={{this.textElementId}}
        />
      {{/if}}
    </span>
  </template>
}

const Controls = <template>
  {{#if @expandable}}
    <button
      class="link-button expand-text-button"
      title={{t "general.expand"}}
      type="button"
      data-test-expand
      data-test-fade-text-control
      aria-expanded="false"
      aria-controls={{@fadeTextId}}
      {{on "click" @expand}}
    >
      <FaIcon @icon={{faAnglesDown}} />
    </button>
  {{else}}
    {{#if @collapsible}}
      <button
        class="link-button collapse-text-button"
        title={{t "general.collapse"}}
        type="button"
        data-test-collapse
        data-test-fade-text-control
        aria-expanded="true"
        aria-controls={{@fadeTextId}}
        {{on "click" @collapse}}
      >
        <FaIcon @icon={{faAnglesUp}} />
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
      id={{@id}}
    >
      <div class="display-text" {{onResize @resize}} data-test-text>
        {{this.displayText}}
      </div>
    </div>
  </template>
}
