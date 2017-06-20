import Ember from 'ember';
import layout from '../templates/components/ilios-calendar';
import moment from 'moment';

const { Component, computed, RSVP, copy } = Ember;
const { Promise } = RSVP;

export default Component.extend({
  layout,
  classNames: ['ilios-calendar'],
  selectedView: null,
  selectedDate: null,
  calendarEventsPromise: false,
  icsFeedUrl: null,
  showIcsFeed: false,
  compiledCalendarEvents: computed('calendarEventsPromise.[]', 'selectedView', function(){
    return new Promise(resolve => {
      this.get('calendarEventsPromise').then(events => {
        if(this.get('selectedView') === 'day'){
          resolve(events);
        } else {
          let hashedEvents = {};

          events.forEach(event => {
            let hash = moment(event.startDate).format() +
                       moment(event.endDate).format() +
                       event.name;
            if(!(hash in hashedEvents)){
              hashedEvents[hash] = Ember.A();
            }
            //clone our event so we don't trample on the original when we change location
            hashedEvents[hash].pushObject(copy(event));
          });
          let compiledEvents = Ember.A();
          for(let hash in hashedEvents){
            let arr = hashedEvents[hash];
            let event = arr[0];
            if(arr.length > 1){
              event.isMulti = true;
            }
            compiledEvents.pushObject(event);

          }

          resolve(compiledEvents);
        }
      });
    });
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

      let durrationA = moment(a.startDate).diff(moment(a.endDate));
      let durrationB = moment(b.startDate).diff(moment(b.endDate));

      let durationDiff = durrationA - durrationB;

      if (durationDiff !== 0) {
        return durationDiff;
      }

      return a.title - b.title;

    },
  }
});
