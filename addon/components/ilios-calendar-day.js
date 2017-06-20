import Ember from 'ember';
import moment from 'moment';
import layout from '../templates/components/ilios-calendar-day';

const { run, computed, isEmpty } = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['ilios-calendar-day'],
  date: null,
  calendarEvents: [],
  didInsertElement(){
    run.next(() => {
      this.$(".el-calendar .week").scrollTop(500);
    });
  },
  singleDayEvents: computed('calendarEvents.[]', function(){
    const events = this.get('calendarEvents');
    if(isEmpty(events)){
      return [];
    }
    return events.filter(
      event => moment(event.startDate).isSame(moment(event.endDate), 'day')
    );
  }),
  multiDayEventsList: computed('calendarEvents.[]', function(){
    const events = this.get('calendarEvents');
    if(isEmpty(events)){
      return [];
    }
    return events.filter(
      event => !moment(event.startDate).isSame(moment(event.endDate), 'day')
    );
  }),
});
