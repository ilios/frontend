import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  showProgress: false,
  totalProgress: null,
  currentProgress: null,
  'data-test-wait-saving': true,
  progress: computed('totalProgress', 'currentProgress', function(){
    const total = this.get('totalProgress') || 1;
    const current = this.get('currentProgress') || 0;

    return Math.floor(current / total * 100);
  })
});
