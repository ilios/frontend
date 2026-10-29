import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isTesting } from '@embroider/macros';
import { task } from 'ember-concurrency';

const DELAY = 15000;

export default class HeartbeatService extends Service {
  @tracked latestCode = undefined;
  @tracked latestMessage = undefined;
  @tracked counter = DELAY / 1000;
  @tracked index = 0;

  get url() {
    const codes = [200, 503];
    const code = codes[this.index];
    return `https://dave.neb.host?http_code=${code}`;
  }

  constructor() {
    super(...arguments);
    // don't autostart this task in a test environment.
    if (!isTesting()) {
      this.checkConnection.perform();
    }
  }

  checkConnection = task(async () => {
    try {
      const response = await fetch(this.url);
      const payload = await response.json();
      this.latestCode = payload.status ?? undefined;
      this.latestMessage = payload.message ?? undefined;
      this.index = this.index == 0 ? 1 : 0;
    } catch (e) {
      this.onError(e);
    } finally {
      if (!isTesting()) {
        this.counter = DELAY / 1000;
        const intervalID = setInterval(() => {
          this.counter -= 1;

          if (this.counter == 0) {
            clearInterval(intervalID);
            this.checkConnection.perform();
          }
        }, 1000);
      }
    }
  });

  onError(error) {
    if (!isTesting()) {
      console.error(error);
    }
  }
}
