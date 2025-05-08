import Component from '@glimmer/component';
import { restartableTask, timeout } from 'ember-concurrency';
import { guidFor } from '@ember/object/internals';

export default class OfferingUrlDisplayComponent extends Component {
  get copyButtonId() {
    return `offering-url-display-copy-button-${guidFor(this)}`;
  }

  get copyButtonElement() {
    return document.getElementById(this.copyButtonId);
  }

  copy = restartableTask(async () => {
    await timeout(1500);
  });
}

{{#if @url}}
  <span class="offering-url-display" ...attributes>
    <a title={{@url}} href={{@url}}>{{t "general.virtualSessionLink"}}</a>
    <CopyButton
      title={{t "general.copyLink"}}
      @clipboardText={{@url}}
      @success={{perform this.copy}}
      class={{if this.copy.isRunning "copying"}}
      id={{this.copyButtonId}}
      data-test-copy-url
    >
      {{#if this.copy.isRunning}}
        <FaIcon @icon="check" />
      {{else}}
        <FaIcon @icon="copy" />
      {{/if}}
    </CopyButton>
  </span>
  {{#if this.copy.isRunning}}
    <IliosTooltip
      @target={{this.copyButtonElement}}
      @options={{hash placement="right"}}
      class="offering-url-display-success-message-tooltip"
    >
      {{t "general.copiedSuccessfully"}}
    </IliosTooltip>
  {{/if}}
{{/if}}