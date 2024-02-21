import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency';

export default class UpdateNotificationComponent extends Component {
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
    if (this.args.reload) {
      this.args.reload();
    }
  });
}
