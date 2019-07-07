import Component from '@ember/component';
import layout from '../templates/components/api-version-notice';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { set } from '@ember/object';

export default Component.extend({
  apiVersion: service(),
  layout,
  tagName: '',

  mismatched: false,
  updateAvailable: false,
  countdownToUpdate: null,
  showReloadButton: false,

  check: task(function* () {
    const mismatched = yield this.apiVersion.isMismatched;
    if (mismatched && 'serviceWorker' in navigator) {
      yield (2000); //wait to let the new service worker get fetched if it is available
      const reg = yield navigator.serviceWorker.getRegistration();
      if (reg) {
        if (reg.waiting) {
          this.update.perform();
        } else {
          reg.onupdatefound = () => {
            this.countdown.perform();
          };
        }
      } else {
        set(this, 'showReloadButton', true);
      }
    }
    this.set('mismatched', mismatched);
    return true; //always return true to update data-test-load-finished property
  }).drop().on('didInsertElement'),

  actions: {
    reload() {
      window.location.reload();
    }
  },

  countdown: task(function* () {
    this.set('updateAvailable', true);
    for (let i = 5; i > 0; i--) {
      this.set('countdownToUpdate', i);
      yield timeout(1000);
    }
    yield this.update.perform();
  }).drop(),
  update: task(function* () {
    if ('serviceWorker' in navigator) {
      const reg = yield navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage('skipWaiting');
      }
    }
    yield timeout(3000);
  }).drop(),
});
