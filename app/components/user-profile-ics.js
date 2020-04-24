import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  iliosConfig: service(),

  tagName: "",

  finishedSetup: false,
  hasSavedRecently: false,
  icsFeedKey: null,
  isManageable: false,
  isManaging: false,
  showCopySuccessMessage: false,
  user: null,

  host: reads('iliosConfig.apiHost'),

  icsFeedUrl: computed('icsFeedKey', 'host', function() {
    const icsFeedKey = this.icsFeedKey;
    let host = this.host;
    if (isPresent(icsFeedKey)) {
      if (isEmpty(host)) {
        host = window.location.protocol + '//' + window.location.hostname;
        const port = window.location.port;

        if (![80, 443].includes(port)) {
          host += ':' + port;
        }
      }
      return host  + '/ics/' + icsFeedKey;
    }

    return null;
  }),

  didReceiveAttrs() {
    this._super(...arguments);
    const user = this.user;
    if (isPresent(user)) {
      this.set('icsFeedKey', user.get('icsFeedKey'));
    } else {
      this.set('icsFeedKey', null);
    }
  },

  /**
   * Generate a random token from a combination of
   * the user id, a random string and the current time
   * Implementation lifted from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
   * @param String userId
   * @return String
   */
  async randomToken(userId) {
    const now = Date.now();
    const randomValue = Math.random().toString(36).substr(2);
    const msgUint8 = new TextEncoder().encode(userId + randomValue + now); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
  },

  refreshKey: task(function* () {
    const user = this.user;
    const token = yield this.randomToken(user.get('id'));
    user.set('icsFeedKey', token);
    yield user.save();
    this.setIsManaging(false);
    this.set('hasSavedRecently', true);
    yield timeout(500);
    this.set('hasSavedRecently', false);
  }).drop(),

  textCopied: task(function* () {
    this.set('showCopySuccessMessage', true);
    yield timeout(3000);
    this.set('showCopySuccessMessage', false);
  }).restartable()
});
