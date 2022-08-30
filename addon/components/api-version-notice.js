import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';

export default class ApiVersionNoticeComponent extends Component {
  @service apiVersion;

  @tracked mismatched = false;
  @tracked updateAvailable = false;
  @tracked countdownToUpdate = null;
  @tracked showReloadButton = false;

  reload() {
    window.location.reload();
  }

  check = dropTask(async () => {
    const mismatched = await this.apiVersion.getIsMismatched();
    if (mismatched && 'serviceWorker' in navigator) {
      await 2000; //wait to let the new service worker get fetched if it is available
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        if (reg.waiting) {
          this.update.perform();
        } else {
          reg.onupdatefound = () => {
            this.countdown.perform();
          };
        }
      } else {
        this.showReloadButton = true;
      }
    }
    this.mismatched = mismatched;
    return true; //always return true to update data-test-load-finished property
  });

  countdown = dropTask(async () => {
    this.updateAvailable = true;
    for (let i = 5; i > 0; i--) {
      this.countdownToUpdate = i;
      await timeout(1000);
    }
    await this.update.perform();
  });

  update = dropTask(async () => {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage('skipWaiting');
      }
    }
    await timeout(3000);
  });
}
