import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed, RSVP } = Ember;
const { PromiseArray } = DS;

export default Component.extend({
  cohorts: [],
  sortedCohorts: computed('cohorts.@each.{school,displayTitle}', function(){
    let defer = RSVP.defer();

    this.get('cohorts').then(cohorts => {
      defer.resolve(cohorts.sortBy('school', 'displayTitle'));
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),
});
