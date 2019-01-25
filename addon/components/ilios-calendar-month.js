import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/ilios-calendar-month';

export default Component.extend({
  layout,
  classNames: ['ilios-calendar-month'],
  date: null,
  calendarEvents: null,
  showMore: null,
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
  actions: {
    changeToDayView(date){
      this.get('changeDate')(date);
      this.get('changeView')('day');
    },
  }
});
