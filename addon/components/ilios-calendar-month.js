import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['ilios-calendar-month'],
  date: null,
  calendarEvents: null,
  showMore: null,
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
  actions: {
    changeToDayView(date){
      this.get('changeDate')(date);
      this.get('changeView')('day');
    },
  }
});
