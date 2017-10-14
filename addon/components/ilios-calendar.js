import Ember from 'ember';
import layout from '../templates/components/ilios-calendar';
import moment from 'moment';

const { Component, computed, copy } = Ember;

export default Component.extend({
  layout,
  classNames: ['ilios-calendar'],
  selectedView: null,
  selectedDate: null,
  calendarEventsPromise: null,
  icsFeedUrl: null,
  showIcsFeed: false,
  compiledCalendarEvents: computed('calendarEventsPromise.[]', 'selectedView', async function(){
    const events = await this.get('calendarEventsPromise');
    if(this.get('selectedView') === 'day'){
      return events;
    } else {
      let hashedEvents = {};
      events.forEach(event => {
        let hash = moment(event.startDate).format() +
          moment(event.endDate).format() +
          event.name;
        if (!(hash in hashedEvents)) {
          hashedEvents[hash] = [];
        }
        //clone our event so we don't trample on the original when we change location
        hashedEvents[hash].pushObject(copy(event));
      });
      let compiledEvents = [];
      for (let hash in hashedEvents) {
        let arr = hashedEvents[hash];
        let event = arr[0];
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
      let newDate = moment(this.get('selectedDate')).add(1, this.get('selectedView')).toDate();
      this.get('changeDate')(newDate);
    },
    goBack(){
      let newDate = moment(this.get('selectedDate')).subtract(1, this.get('selectedView')).toDate();
      this.get('changeDate')(newDate);
    },
    gotoToday(){
      let newDate = moment().toDate();
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
      let startDiff = moment(a.startDate).diff(moment(b.startDate));
      if (startDiff !== 0) {
        return startDiff;
      }

      let durationA = moment(a.startDate).diff(moment(a.endDate));
      let durationB = moment(b.startDate).diff(moment(b.endDate));

      let durationDiff = durationA - durationB;

      if (durationDiff !== 0) {
        return durationDiff;
      }

      return a.title - b.title;

    },
  }
});
