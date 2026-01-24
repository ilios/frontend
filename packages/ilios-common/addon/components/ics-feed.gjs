import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import CopyButton from 'ilios-common/components/copy-button';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import mouseHoverToggle from 'ilios-common/modifiers/mouse-hover-toggle';
import set from 'ember-set-helper/helpers/set';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import IliosTooltip from 'ilios-common/components/ilios-tooltip';
import { faSquareRss } from '@fortawesome/free-solid-svg-icons';

export default class IcsFeedComponent extends Component {
  @service flashMessages;
  @service intl;
  get copyButtonId() {
    return `ics-feed-copy-button-${guidFor(this)}`;
  }

  get copyButtonElement() {
    return document.getElementById(this.copyButtonId);
  }

  textCopied = task({ restartable: true }, async () => {
    this.flashMessages.success(this.intl.t('general.copiedIcsFeedUrl'));
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

  getIcsFeedUrl = () => {
    return this.args.url;
  };
  <template>
    <div class="ilios-calendar-ics-feed" data-test-ics-feed ...attributes>
      <CopyButton
        @getClipboardText={{this.getIcsFeedUrl}}
        @success={{perform this.textCopied}}
        aria-label={{t "general.copyIcsFeedUrl"}}
        class="link-button highlight"
        id={{this.copyButtonId}}
        {{mouseHoverToggle (set this "showTooltip")}}
      >
        <FaIcon @icon={{faSquareRss}} />
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
