import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';

export default class ApiVersionNoticeComponent extends Component {
  @service apiVersion;

  @tracked mismatched = false;
  @tracked updateAvailable = false;
  @tracked countdownToUpdate = null;
  @tracked showReloadButton = false;

  reload() {
    window.location.reload();
  }

  @dropTask
  *check() {
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
        this.showReloadButton = true;
      }
    }
    this.mismatched = mismatched;
    return true; //always return true to update data-test-load-finished property
  }

  @dropTask
  *countdown() {
    this.updateAvailable = true;
    for (let i = 5; i > 0; i--) {
      this.countdownToUpdate = i;
      yield timeout(1000);
    }
    yield this.update.perform();
  }
  @dropTask
  *update() {
    if ('serviceWorker' in navigator) {
      const reg = yield navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage('skipWaiting');
      }
    }
    yield timeout(3000);
  }
}
