import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ENV from 'ilios/config/environment';
import { task, timeout } from 'ember-concurrency';

const { apiVersion } = ENV.APP;

export default Component.extend({
  iliosConfig: service(),
  versionMismatch: false,
  updateAvailable: false,
  countdownToUpdate: null,
  updatePending: false,
  unableToFindUpdate: false,

  didInsertElement() {
    this.loadAttributes.perform();
  },
  loadAttributes: task(function* () {
    const iliosConfig = this.get('iliosConfig');
    const serverApiVersion = yield iliosConfig.get('apiVersion');
    const versionMismatch = serverApiVersion !== apiVersion;
    if (versionMismatch && 'serviceWorker' in navigator) {
      yield (1000); //wait a second to let the new service worker get fetched if it is available
      const reg = yield navigator.serviceWorker.getRegistration();
      if (reg) {
        if (reg.waiting) {
          this.update.perform();
        } else {
          reg.onupdatefound = () => {
            this.countdown.perform();
          };
        }
      }
    }
    this.set('versionMismatch', versionMismatch);
  }).drop(),
  countdown: task(function* () {
    this.set('updateAvailable', true);
    for (let i = 5; i > 0; i--) {
      this.set('countdownToUpdate', i);
      yield timeout(1000);
    }
    yield this.update.perform();
  }).drop(),
  update: task(function* () {
    this.set('updateAvailable', false);
    this.set('updatePending', true);
    if ('serviceWorker' in navigator) {
      const reg = yield navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage('skipWaiting');
      }
    }
    yield timeout(3000);
    this.set('updatePending', false);
    this.set('unableToFindUpdate', true);
  }).drop(),
});
