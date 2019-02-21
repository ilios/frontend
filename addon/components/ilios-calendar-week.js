import Component from '@ember/component';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';
import { isEmpty } from '@ember/utils';
import moment from 'moment';
import layout from '../templates/components/ilios-calendar-week';

export default Component.extend({
  layout,
  classNames: ['ilios-calendar-week'],
  date: null,
  calendarEvents: null,
  areEventsSelectable: true,
  areDaysSelectable: true,
  weekOf: computed('date', function(){
    return moment(this.get('date')).startOf('week').format('MMMM Do YYYY');
  }),
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
  multiDayEventsList: computed('nonIlmPreWorkEvents.[]', function(){
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
  actions: {
    changeToDayView(date){
      const changeDate = this.get('changeDate');
      const changeView = this.get('changeView');
      const areDaysSelectable = this.get('areDaysSelectable');
      if (areDaysSelectable && changeDate && changeView) {
        changeDate(date);
        changeView('day');
      }
    },
    selectEvent(evt){
      const selectEvent = this.get('selectEvent');
      const areEventsSelectable = this.get('areEventsSelectable');
      if (areEventsSelectable && selectEvent) {
        selectEvent(evt);
      }
    }
  }
});
