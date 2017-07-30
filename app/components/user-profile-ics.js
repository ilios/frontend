import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';
import SHA256 from 'cryptojs/sha256';

const { Component, isPresent, isEmpty, computed } = Ember;
const { reads } = computed;

export default Component.extend({
  iliosConfig: Ember.inject.service(),

  didReceiveAttrs(){
    this._super(...arguments);
    const user = this.get('user');
    if (isPresent(user)) {
      this.set('icsFeedKey', user.get('icsFeedKey'));
    } else {
      this.set('icsFeedKey', null);
    }
  },

  host: reads('iliosConfig.apiHost'),

  classNameBindings: [':user-profile-ics', ':small-component', 'hasSavedRecently:has-saved:has-not-saved'],

  user: null,
  isManaging: false,
  isManagable: false,
  icsFeedKey: null,
  hasSavedRecently: false,
  finishedSetup: false,
  showCopySuccessMessage: false,

  /**
   * Generate a random token from a combination of
   * the userid, a random string and the curent time
   * @param String userId
   * @return String
   */
  randomToken(userId){
    const now = Date.now();
    const randomValue = Math.random().toString(36).substr(2);
    const hash = SHA256(userId + randomValue + now).toString();

    return hash;
  },
  refreshKey: task(function * (){
    const user = this.get('user');
    const token = this.randomToken(user.get('id'));

    user.set('icsFeedKey', token);
    yield user.save();

    this.get('setIsManaging')(false);
    this.set('hasSavedRecently', true);
    yield timeout(500);
    this.set('hasSavedRecently', false);

  }).drop(),

  textCopied: task(function * (){
    this.set('showCopySuccessMessage', true);
    yield timeout(3000);
    this.set('showCopySuccessMessage', false);
  }).restartable(),

  icsFeedUrl: computed('icsFeedKey', 'host', function(){
    const icsFeedKey = this.get('icsFeedKey');
    let host = this.get('host');
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
});
