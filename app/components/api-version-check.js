/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ENV from 'ilios/config/environment';
import serviceWorkerHasUpdate from 'ilios/utils/service-worker-has-update';

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
      const hasUpdate = await serviceWorkerHasUpdate();
      if (hasUpdate) {
        const reg = await navigator.serviceWorker.getRegistration();
        reg.waiting.postMessage('skipWaiting');
      }
    }
    this.set('versionMismatch', versionMismatch);
  },
});
