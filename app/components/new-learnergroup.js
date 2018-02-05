/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  multiModeSupported: false,
  fillModeSupported: false,
  singleMode: true,
  classNames: ['new-learnergroup'],

  actions: {
    generateNewLearnerGroups(num){
      this.sendAction('generateNewLearnerGroups', num);
    }
  }
});
