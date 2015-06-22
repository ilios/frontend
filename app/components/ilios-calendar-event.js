/* global moment */
import Ember from 'ember';
import layout from '../templates/components/ilios-calendar-event';
import { default as CalendarEvent } from 'el-calendar/components/calendar-event';

export default CalendarEvent.extend({
  layout: layout,
  viewType: 'day',
  event: null,
  classNameBindings: [':event', ':event-pos', ':ilios-calendar-event', 'event.eventClass', 'viewType'],
  toolTipMessage: Ember.computed('event', function(){
    let str = this.get('event.location') + '<br />' +
      moment(this.get('event.startDate')).format('h:mma') + ' - ' +
      moment(this.get('event.endDate')).format('h:mma') + '<br />' +
      this.get('event.name');

    return str;
  }),
  style: Ember.computed(function() {
    if(this.get('viewType') === 'month-event'){
      return '';
    }
    let escape = Ember.Handlebars.Utils.escapeExpression;

    return Ember.String.htmlSafe(
      `top: ${escape(this.calculateTop())}%;
       height: ${escape(this.calculateHeight())}%;
       left: ${escape(this.calculateLeft())}%;
       width: ${escape(this.calculateWidth())}%;`
    );
  }),
  click(){
    this.sendAction('action', this.get('event'));
  }
});
