/* global moment */
import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  classNames: ['dashboard-agenda'],
  userEvents: Ember.inject.service(),
  selectedDate: null,
  fromTimeStamp: Ember.computed('selectedDate', function(){
    return moment(this.get('selectedDate')).unix();
  }),
  toTimeStamp: Ember.computed('selectedDate', function(){
    return moment(this.get('selectedDate')).add(7, 'days').unix();
  }),
  weeksEvents: Ember.computed('fromTimeStamp', 'toTimeStamp', function(){
    return DS.PromiseArray.create({
      promise: this.get('userEvents').getEvents(this.get('fromTimeStamp'), this.get('toTimeStamp'))
    });
  }),
});
