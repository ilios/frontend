import Component from '@ember/component';
import layout from '../templates/components/week-glance-event';

export default Component.extend({
  layout,
  tagName: '',
  actions: {
    sortString(a, b){
      return a.localeCompare(b);
    }
  }
});
