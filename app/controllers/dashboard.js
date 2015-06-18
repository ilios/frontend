/* global moment */
import Ember from 'ember';
import DS from 'ember-data';
import { moment as momentHelper } from 'ember-moment/computed';

export default Ember.Controller.extend({
  currentUser: Ember.inject.service(),
  queryParams: ['date','view', 'event'],
  date: null,
  event: null,
  view: 'week',
  isEventView: Ember.computed.equal('view', 'event'),
  selectedDate: Ember.computed('date', function(){
    if(this.get('date')){
      return moment(this.get('date'), 'YYYY-MM-DD').format();
    }

    return moment().format();
  }),
  selectedEvent: Ember.computed('event', 'userEvents.[]', function(){
    return this.get('userEvents').objectAt(this.get('event'));
  }),
  fromTimeStamp: Ember.computed('selectedDate', 'selectedView', function(){
    return moment(this.get('selectedDate')).startOf(this.get('selectedView')).unix();
  }),
  toTimeStamp: Ember.computed('selectedDate', 'selectedView', function(){
    return moment(this.get('selectedDate')).endOf(this.get('selectedView')).unix();
  }),
  selectedView: Ember.computed('view', function(){
    let view = this.get('view');
    let viewOptions = ['month', 'week', 'day', 'event'];
    if(viewOptions.indexOf(view) === -1){
      view = 'week';
    }

    return view;
  }),
  calendarDate: momentHelper('selectedDate', 'YYYY-MM-DD'),

  userEvents: Ember.computed('currentUser', 'fromTimeStamp', 'toTimeStamp', function(){
    return DS.PromiseArray.create({
      promise: this.get('currentUser').events(this.get('fromTimeStamp'), this.get('toTimeStamp'))
    });
  }),
  actions: {
    setView(view){
      this.set('view', view);
      this.set('event', null);
    },
    goForward(){
      let newDate = moment(this.get('selectedDate')).add(1, this.get('selectedView')).format('YYYY-MM-DD');
      this.set('date', newDate);
    },
    goBack(){
      let newDate = moment(this.get('selectedDate')).subtract(1, this.get('selectedView')).format('YYYY-MM-DD');
      this.set('date', newDate);
    },
    gotoToday(){
      let newDate = moment().format('YYYY-MM-DD');
      this.set('date', newDate);
    },
    selectEvent(event){
      let index = this.get('userEvents').indexOf(event);
      if(index !== -1){
        this.set('event', index);
        this.set('view', 'event');
      }
    },
    clearEvent(){
      this.set('event', null);
      this.set('view', 'week');
    }
  }
});
