/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import DomMixin from 'ember-lifeline/mixins/dom';
import { task, timeout } from 'ember-concurrency';
import { computed } from '@ember/object';

export default Component.extend(DomMixin, {
  attributeBindings: ['ariaHidden:aria-hidden'],
  classNameBindings: [':connection-status', 'isOnline::offline'],
  isOnline: true,
  timer: 5,
  multiplier: 1,
  unableToReconnect: false,
  stopAttemptingToReconnect: false,
  didInsertElement() {
    this._super(...arguments);
    if (!navigator.onLine) {
      this.changeConnectionState.perform(false);
    }
    this.addEventListener(window, 'online', () => {
      this.changeConnectionState.perform(true);
    });
    this.addEventListener(window, 'offline', () => {
      this.changeConnectionState.perform(false);
    });
  },
  ariaHidden: computed('isOnline', function () {
    const isOnline = this.isOnline;
    return isOnline?'true':false;
  }),
  ariaRole: computed('isOnline', function () {
    const isOnline = this.isOnline;
    return isOnline?false:'alert';
  }),
  changeConnectionState: task(function * (isOnline) {
    this.set('timer', 5);
    this.set('multiplier', 1);
    this.set('stopAttemptingToReconnect', false);
    this.set('isOnline', isOnline);
    const reconnect = this.reconnect;
    if (!isOnline) {
      yield reconnect.perform();
    } else {
      reconnect.cancelAll();
    }
  }).restartable(),
  reconnect: task(function* (force) {
    if (navigator.onLine) {
      this.changeConnectionState.perform(true);
    }
    const timer = this.timer;
    if (force) {
      this.set('unableToReconnect', true);
      this.set('timer', 5);
      yield timeout(2000);
      this.set('unableToReconnect', false);
    } else if (timer > 1) {
      this.set('unableToReconnect', false);
      this.set('timer', timer - 1);
    } else {
      const stopAttemptingToReconnect = this.stopAttemptingToReconnect;
      if (!stopAttemptingToReconnect) {
        this.set('unableToReconnect', true);
        yield timeout(2000);
      }
      const multiplier = this.multiplier;
      const newMultiplier = multiplier < 8?multiplier * 2:10;
      this.set('multiplier', newMultiplier);
      this.set('timer', 5 * newMultiplier);
    }

    yield timeout(1000);
    this.reconnect.perform();
  }).restartable(),
});
