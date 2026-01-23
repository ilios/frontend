import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';
import { guidFor } from '@ember/object/internals';
import t from 'ember-intl/helpers/t';
import CopyButton from 'ilios-common/components/copy-button';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import IliosTooltip from 'ilios-common/components/ilios-tooltip';
import { hash } from '@ember/helper';
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';

export default class OfferingUrlDisplayComponent extends Component {
  get copyButtonId() {
    return `offering-url-display-copy-button-${guidFor(this)}`;
  }

  get copyButtonElement() {
    return document.getElementById(this.copyButtonId);
  }

  copy = task({ restartable: true }, async () => {
    await timeout(1500);
  });

  getOfferingLink = () => {
    return this.args.url;
  };
  <template>
    {{#if @url}}
      <span class="offering-url-display" ...attributes>
        <a title={{@url}} href={{@url}}>{{t "general.virtualSessionLink"}}</a>
        <CopyButton
          @getClipboardText={{this.getOfferingLink}}
          @success={{perform this.copy}}
          class={{if this.copy.isRunning "copying"}}
          id={{this.copyButtonId}}
          title={{t "general.copyLink"}}
          data-test-copy-url
        >
          {{#if this.copy.isRunning}}
            <FaIcon @icon={{faCheck}} />
          {{else}}
            <FaIcon @icon={{faCopy}} />
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
  </template>
}
