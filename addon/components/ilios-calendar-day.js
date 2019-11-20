import Component from '@ember/component';
import { run } from '@ember/runloop';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import moment from 'moment';

export default Component.extend({
  classNames: ['ilios-calendar-day'],
  date: null,
  calendarEvents: null,
  areEventsSelectable: true,
  ilmPreWorkEvents: computed('calendarEvents.[]', function () {
    const calendarEvents = this.calendarEvents || [];
    const preWork =  calendarEvents.reduce((arr, eventObject) => {
      return arr.pushObjects(eventObject.prerequisites);
    }, []);

    return preWork.filter(ev => ev.ilmSession);
  }),

  nonIlmPreWorkEvents: computed('calendarEvents.[]', function () {
    const calendarEvents = this.calendarEvents || [];
    return calendarEvents.filter(ev => {
      return ev.postrequisites.length === 0 || !ev.ilmSession;
    });
  }),
  singleDayEvents: computed('nonIlmPreWorkEvents.[]', function(){
    const events = this.get('nonIlmPreWorkEvents');
    if(isEmpty(events)){
      return [];
    }
    return events.filter(
      event => moment(event.startDate).isSame(moment(event.endDate), 'day')
    );
  }),
  multiDayEvents: computed('nonIlmPreWorkEvents.[]', function(){
    const events = this.get('nonIlmPreWorkEvents');
    if(isEmpty(events)){
      return [];
    }
    return events.filter(
      event => !moment(event.startDate).isSame(moment(event.endDate), 'day')
    );
  }),
  didInsertElement(){
    run.next(() => {
      if (!this.isDestroyed && !this.isDestroying && this.element) {
        this.element.querySelector(".el-calendar .week").scrollTop = 500;
      }
    });
  },
});
