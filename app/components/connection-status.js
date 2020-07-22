import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { addEventListener, runDisposables } from 'ember-lifeline';

export default class ConnectionStatusComponent extends Component {
  @tracked isOnline = true;
  @tracked multiplier = 1;
  @tracked stopAttemptingToReconnect = false;
  @tracked timer = 5;
  @tracked unableToReconnect = false;

  @action
  setup() {
    if (!navigator.onLine) {
      this.changeConnectionState.perform(false);
    }
    addEventListener(this, window, 'online', () => {
      this.changeConnectionState.perform(true);
    });
    addEventListener(this, window, 'offline', () => {
      this.changeConnectionState.perform(false);
    });
  }

  willDestroy() {
    runDisposables(this);
  }

  @restartableTask
  * changeConnectionState(isOnline) {
    this.timer = 5;
    this.multiplier = 1;
    this.stopAttemptingToReconnect = false;
    this.isOnline = isOnline;
    if (!isOnline) {
      yield this.reconnect.perform();
    } else {
      this.reconnect.cancelAll();
    }
  }

  @restartableTask
  * reconnect(force) {
    if (navigator.onLine) {
      this.changeConnectionState.perform(true);
    }
    if (force) {
      this.unableToReconnect = true;
      this.timer = 5;
      yield timeout(2000);
      this.unableToReconnect = false;
    } else if (this.timer > 1) {
      this.unableToReconnect = false;
      this.timer = this.timer - 1;
    } else {
      if (!this.stopAttemptingToReconnect) {
        this.unableToReconnect = true;
        yield timeout(2000);
      }
      const newMultiplier = this.multiplier < 8 ? this.multiplier * 2 : 10;
      this.multiplier = newMultiplier;
      this.timer = 5 * newMultiplier;
    }

    yield timeout(1000);
    this.reconnect.perform();
  }
}
