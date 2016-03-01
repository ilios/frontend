import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed, RSVP } = Ember;
const { PromiseArray } = DS;

export default Component.extend({
  competencies: [],
  sortedCompetencies: computed('competencies.[]', function(){
    let defer = RSVP.defer();

    this.get('competencies').then(competencies => {
      defer.resolve(competencies.sortBy('title'));
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),
});
