/* global moment */
import Ember from 'ember';
import { default as CalendarEvent } from 'el-calendar/components/calendar-event';

export default CalendarEvent.extend({
  viewType: 'day',
  event: null,
  classNameBindings: [':event', ':ilios-calendar-event', 'event.eventClass', 'viewType'],
  toolTipMessage: Ember.computed('event', function(){
    let str = this.get('event.location') + '<br />' +
      moment(this.get('event.startDate')).format('h:mma') + ' - ' +
      moment(this.get('event.endDate')).format('h:mma') + '<br />' +
      this.get('event.name'); 

    return str;
  }),
  style: Ember.computed('viewType', function() {
    let escape = Ember.Handlebars.Utils.escapeExpression;
    if(this.get('viewType') !== 'month-event'){
      return Ember.String.htmlSafe(
        `top: ${escape(this.calculateTop())}%;
         height: ${escape(this.calculateHeight())}%;`
      );
    }
  }),
  click(){
    this.sendAction('action', this.get('event'));
  }
});
