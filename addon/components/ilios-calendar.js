import Component from '@ember/component';
import { computed } from '@ember/object';
import { copy } from '@ember/object/internals';
import moment from 'moment';

export default Component.extend({
  classNames: ['ilios-calendar'],
  selectedView: null,
  selectedDate: null,
  calendarEvents: null,
  icsFeedUrl: null,
  showIcsFeed: false,
  compiledCalendarEvents: computed('calendarEvents.[]', 'selectedView', function(){
    const events = this.get('calendarEvents');
    if(this.get('selectedView') === 'day'){
      return events;
    } else {
      const hashedEvents = {};
      events.forEach(event => {
        const hash = moment(event.startDate).format() +
          moment(event.endDate).format() +
          event.name;
        if (!(hash in hashedEvents)) {
          hashedEvents[hash] = [];
        }
        //clone our event so we don't trample on the original when we change location
        hashedEvents[hash].pushObject(copy(event));
      });
      const compiledEvents = [];
      let hash;
      for (hash in hashedEvents) {
        const arr = hashedEvents[hash];
        const event = arr[0];
        if (arr.length > 1) {
          event.isMulti = true;
        }
        compiledEvents.pushObject(event);
      }
      return compiledEvents;
    }
  }),
  actions: {
    changeDate(newDate){
      this.get('changeDate')(newDate);
    },
    goForward(){
      const newDate = moment(this.get('selectedDate')).add(1, this.get('selectedView')).toDate();
      this.get('changeDate')(newDate);
    },
    goBack(){
      const newDate = moment(this.get('selectedDate')).subtract(1, this.get('selectedView')).toDate();
      this.get('changeDate')(newDate);
    },
    gotoToday(){
      const newDate = moment().toDate();
      this.get('changeDate')(newDate);
    },
    selectEvent(event){
      this.get('selectEvent')(event);
    },
    refreshIcsFeed(){
      this.set('icsFeedUrl', null);
      this.get('refreshIcsFeed')();
    },
    sortEvents(a, b){
      const startDiff = moment(a.startDate).diff(moment(b.startDate));
      if (startDiff !== 0) {
        return startDiff;
      }

      const durationA = moment(a.startDate).diff(moment(a.endDate));
      const durationB = moment(b.startDate).diff(moment(b.endDate));

      const durationDiff = durationA - durationB;

      if (durationDiff !== 0) {
        return durationDiff;
      }

      return a.title - b.title;

    },
  }
});
