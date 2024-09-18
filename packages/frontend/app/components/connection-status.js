import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { registerDestructor } from '@ember/destroyable';
import { action } from '@ember/object';

export default class ConnectionStatusComponent extends Component {
  @tracked isOnline = true;
  @tracked multiplier = 1;
  @tracked stopAttemptingToReconnect = false;
  @tracked timer = 5;
  @tracked unableToReconnect = false;
  onlineListener;
  offlineListener;

  constructor(...args) {
    super(...args);
    if (!navigator.onLine) {
      this.changeConnectionState.perform(false);
    }
    window.addEventListener('online', this.online, {
      passive: true,
      capture: false,
    });
    window.addEventListener('offline', this.offline, {
      passive: true,
      capture: false,
    });

    registerDestructor(this, () => {
      window.removeEventListener('online', this.online);
      window.removeEventListener('offline', this.offline);
    });
  }

  @action
  online() {
    this.changeConnectionState.perform(true);
  }

  @action
  offline() {
    this.changeConnectionState.perform(false);
  }

  changeConnectionState = restartableTask(async (isOnline) => {
    this.timer = 5;
    this.multiplier = 1;
    this.stopAttemptingToReconnect = false;
    this.isOnline = isOnline;
    if (!isOnline) {
      await this.reconnect.perform();
    } else {
      this.reconnect.cancelAll();
    }
  });

  reconnect = restartableTask(async (force) => {
    if (navigator.onLine) {
      this.changeConnectionState.perform(true);
    }
    if (force) {
      this.unableToReconnect = true;
      this.timer = 5;
      await timeout(2000);
      this.unableToReconnect = false;
    } else if (this.timer > 1) {
      this.unableToReconnect = false;
      this.timer = this.timer - 1;
    } else {
      if (!this.stopAttemptingToReconnect) {
        this.unableToReconnect = true;
        await timeout(2000);
      }
      const newMultiplier = this.multiplier < 8 ? this.multiplier * 2 : 10;
      this.multiplier = newMultiplier;
      this.timer = 5 * newMultiplier;
    }

    await timeout(1000);
    this.reconnect.perform();
  });
}
