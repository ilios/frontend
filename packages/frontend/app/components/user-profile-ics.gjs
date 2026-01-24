import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { fn } from '@ember/helper';
import CopyButton from 'ilios-common/components/copy-button';
import {
  faArrowRotateLeft,
  faCopy,
  faPenToSquare,
  faSpinner,
  faRotate,
} from '@fortawesome/free-solid-svg-icons';

export default class UserProfileIcsComponent extends Component {
  @service iliosConfig;
  @tracked showCopySuccessMessage = false;

  get icsFeedKey() {
    return this.args.user.icsFeedKey;
  }

  get host() {
    return this.iliosConfig.apiHost;
  }

  get icsFeedUrl() {
    if (this.icsFeedKey) {
      let host = this.host;
      if (!host) {
        host = window.location.protocol + '//' + window.location.hostname;
        const port = window.location.port;

        if (![80, 443].includes(port)) {
          host += ':' + port;
        }
      }
      return host + '/ics/' + this.icsFeedKey;
    }

    return null;
  }

  /**
   * Generate a random token from a combination of
   * the user id, a random string and the current time
   *
   * We use two different methods for making this work. Because some versions of safari don't allow
   * usage of the crypto.subtle API in an insecure context we have to fall back on a random string
   * path when that API isn't available.
   *
   * Info on secure context requirement: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle#browser_compatibility
   *
   * Digest implementation lifted from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
   */
  async randomToken(userId) {
    const now = Date.now();
    if (window.isSecureContext) {
      const randomValue = Math.random().toString(36).substring(2);
      const msgUint8 = new TextEncoder().encode(userId + randomValue + now); // encode as (utf-8) Uint8Array
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
      const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let rhett = `${now}${userId}`; //prefix with the time and userId to avoid the remote change of a collision
    const needRandomnessOf = 64 - rhett.length;
    for (let i = 0; i < needRandomnessOf; i++) {
      rhett += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return rhett;
  }

  refreshKey = task({ drop: true }, async () => {
    const token = await this.randomToken(this.args.user.id);
    this.args.user.set('icsFeedKey', token);
    await this.args.user.save();
    this.args.setIsManaging(false);
    this.hasSavedRecently = true;
    await timeout(500);
    this.hasSavedRecently = false;
  });

  textCopied = task({ restartable: true }, async () => {
    this.showCopySuccessMessage = true;
    await timeout(3000);
    this.showCopySuccessMessage = false;
  });

  getIcsFeedUrl = () => {
    return this.icsFeedUrl;
  };
  <template>
    <div
      class="user-profile-ics small-component{{if
          this.hasSavedRecently
          ' has-saved'
          ' has-not-saved'
        }}"
      data-test-user-profile-ics
      ...attributes
    >
      <h3 class="title" data-test-title>
        {{t "general.icsFeed"}}
      </h3>
      <div class="actions">
        {{#if @isManaging}}
          <button
            type="button"
            disabled={{this.refreshKey.isRunning}}
            title={{t "general.refreshIcsFeedKey"}}
            class="refresh-key"
            data-test-refresh-key
            {{on "click" (perform this.refreshKey)}}
          >
            <FaIcon
              @icon={{if this.refreshKey.isRunning faSpinner faRotate}}
              @spin={{this.refreshKey.isRunning}}
            />
          </button>
          <button
            type="button"
            disabled={{this.refreshKey.isRunning}}
            class="bigcancel"
            data-test-cancel
            title={{t "general.close"}}
            {{on "click" (fn @setIsManaging false)}}
          >
            <FaIcon @icon={{faArrowRotateLeft}} />
          </button>
        {{else if @isManageable}}
          <button
            type="button"
            class="manage"
            data-test-manage
            title={{t "general.refreshIcsFeedKey"}}
            {{on "click" (fn @setIsManaging true)}}
          >
            <FaIcon @icon={{faPenToSquare}} />
          </button>
        {{/if}}
      </div>
      <p data-test-key>
        {{#if this.icsFeedKey.length}}
          <p class="ics-instructions" data-test-instructions>
            {{t "general.icsAdminInstructions"}}
          </p>
          <p data-test-copy>
            <CopyButton
              @getClipboardText={{this.getIcsFeedUrl}}
              @success={{perform this.textCopied}}
            >
              <FaIcon @icon={{faCopy}} />
              {{t "general.link"}}
            </CopyButton>
            {{#if this.showCopySuccessMessage}}
              <span class="yes" data-test-success-message>
                {{t "general.copiedSuccessfully"}}
              </span>
            {{/if}}
          </p>
        {{else}}
          {{t "general.none"}}
        {{/if}}
      </p>
    </div>
  </template>
}
