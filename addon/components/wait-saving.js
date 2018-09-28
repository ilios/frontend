import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/wait-saving';

export default Component.extend({
  layout,
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
