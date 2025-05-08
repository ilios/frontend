import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';

export default class IcsFeedComponent extends Component {
  @service flashMessages;

  get copyButtonId() {
    return `ics-feed-copy-button-${guidFor(this)}`;
  }

  get copyButtonElement() {
    return document.getElementById(this.copyButtonId);
  }

  textCopied = restartableTask(async () => {
    this.flashMessages.success('general.copiedIcsFeedUrl');
  });

  popperOptions = {
    placement: 'right',
    modifiers: [
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['bottom'],
        },
      },
    ],
  };
}

<div class="ilios-calendar-ics-feed" data-test-ics-feed ...attributes>
  <CopyButton
    @clipboardText={{@url}}
    @success={{perform this.textCopied}}
    aria-label={{if @instructions @instructions (t "general.copyIcsFeedUrl")}}
    class="link-button highlight"
    id={{this.copyButtonId}}
    {{mouse-hover-toggle (set this "showTooltip")}}
  >
    <FaIcon @icon="square-rss" />
  </CopyButton>
  {{#if this.showTooltip}}
    <IliosTooltip
      @target={{this.copyButtonElement}}
      @options={{this.popperOptions}}
      class="ics-feed-tooltip"
    >
      {{t "general.copyIcsFeedUrl"}}
    </IliosTooltip>
  {{/if}}
</div>