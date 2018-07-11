/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  classNames: ['update-notification'],

  /**
   * send a message to update every tab attached to this worker
   * this message is caught by our sw-skip-wait in-repo addon
   */
  async click() {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage('skipWaiting');
      }
    }
    const reload = this.get('reload');
    if (reload) {
      reload();
    }
  }
});
