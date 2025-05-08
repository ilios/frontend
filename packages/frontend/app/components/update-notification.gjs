import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

export default class UpdateNotificationComponent extends Component {
  @service newVersion;

  /**
   * send a message to update every tab attached to this worker
   * this message is caught by our sw-skip-wait in-repo addon
   */
  click = restartableTask(async () => {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage('skipWaiting');
      }
    }
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload(true);
    }
  });
}
