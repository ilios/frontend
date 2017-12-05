/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import DomMixin from 'ember-lifeline/mixins/dom';
import { task, timeout } from 'ember-concurrency';

export default Component.extend(DomMixin, {
  classNameBindings: [':connection-status', 'isOnline::offline'],
  isOnline: true,
  timer: 5,
  multiplier: 1,
  unableToReconnect: false,
  stopAttemptingToReconnect: false,
  didInsertElement() {
    this._super(...arguments);
    if (!navigator.onLine) {
      this.get('changeConnectionState').perform(false);
    }
    this.addEventListener(window, 'online', () => {
      this.get('changeConnectionState').perform(true);
    });
    this.addEventListener(window, 'offline', () => {
      this.get('changeConnectionState').perform(false);
    });
  },
  changeConnectionState: task(function * (isOnline) {
    this.set('timer', 5);
    this.set('multiplier', 1);
    this.set('stopAttemptingToReconnect', false);
    this.set('isOnline', isOnline);
    const reconnect = this.get('reconnect');
    if (!isOnline) {
      yield reconnect.perform();
    } else {
      reconnect.cancelAll();
    }
  }).restartable(),
  reconnect: task(function* (force) {
    if (navigator.onLine) {
      this.get('changeConnectionState').perform(true);
    }
    const timer = this.get('timer');
    if (force) {
      this.set('unableToReconnect', true);
      this.set('timer', 5);
      yield timeout(2000);
      this.set('unableToReconnect', false);
    } else if (timer > 1) {
      this.set('unableToReconnect', false);
      this.set('timer', timer - 1);
    } else {
      const stopAttemptingToReconnect = this.get('stopAttemptingToReconnect');
      if (!stopAttemptingToReconnect) {
        this.set('unableToReconnect', true);
        yield timeout(2000);
      }
      const multiplier = this.get('multiplier');
      const newMultiplier = multiplier < 8?multiplier * 2:10;
      this.set('multiplier', newMultiplier);
      this.set('timer', 5 * newMultiplier);
    }

    yield timeout(1000);
    this.get('reconnect').perform();
  }).restartable(),
});
