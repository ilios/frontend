import Component from '@ember/component';
import layout from '../templates/components/ics-feed';

export default Component.extend({
  layout: layout,
  classNames: ['ilios-calendar-ics-feed'],
  url: null,
  instructions: null,
  actions: {
    refresh(){
      this.sendAction('refresh');
    }
  }
});
