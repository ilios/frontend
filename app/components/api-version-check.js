/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ENV from 'ilios/config/environment';

const { apiVersion } = ENV.APP;

export default Component.extend({
  iliosConfig: service(),
  versionMismatch: false,

  didInsertElement() {
    this.loadAttributes();
  },
  async loadAttributes() {
    const iliosConfig = this.get('iliosConfig');
    const serverApiVersion = await iliosConfig.get('apiVersion');
    const versionMismatch = serverApiVersion !== apiVersion;
    if (versionMismatch && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage('skipWaiting');
      }
    }
    this.set('versionMismatch', versionMismatch);
  },
});
