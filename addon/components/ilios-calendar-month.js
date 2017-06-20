import Ember from 'ember';
import layout from '../templates/components/ilios-calendar-month';

export default Ember.Component.extend({
  layout,
  classNames: ['ilios-calendar-month'],
  date: null,
  calendarEvents: [],
  showMore: null,
  actions: {
    changeToDayView(date){
      this.get('changeDate')(date);
      this.get('changeView')('day');
    },
  }
});
