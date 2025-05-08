import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import CopyButton from 'ilios-common/components/copy-button';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import mouseHoverToggle from 'ilios-common/modifiers/mouse-hover-toggle';
import set from 'ember-set-helper/helpers/set';
import FaIcon from 'ilios-common/components/fa-icon';
import IliosTooltip from 'ilios-common/components/ilios-tooltip';

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
  <template>
    <div class="ilios-calendar-ics-feed" data-test-ics-feed ...attributes>
      <CopyButton
        @clipboardText={{@url}}
        @success={{perform this.textCopied}}
        aria-label={{if @instructions @instructions (t "general.copyIcsFeedUrl")}}
        class="link-button highlight"
        id={{this.copyButtonId}}
        {{mouseHoverToggle (set this "showTooltip")}}
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
  </template>
}
