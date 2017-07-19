import Ember from 'ember';
import layout from '../templates/components/ics-feed';

export default Ember.Component.extend({
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
