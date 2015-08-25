/* global moment */
import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  classNames: ['dashboard-agenda'],
  userEvents: Ember.inject.service(),
  fromTimeStamp: Ember.computed('selectedDate', function(){
    return moment().hour(0).minute(0).unix();
  }),
  toTimeStamp: Ember.computed('selectedDate', function(){
    return moment().hour(23).minute(59).add(7, 'days').unix();
  }),
  weeksEvents: Ember.computed('fromTimeStamp', 'toTimeStamp', function(){
    return DS.PromiseArray.create({
      promise: this.get('userEvents').getEvents(this.get('fromTimeStamp'), this.get('toTimeStamp'))
    });
  }),
});
