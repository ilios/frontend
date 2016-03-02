import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed, RSVP } = Ember;
const { PromiseArray } = DS;

export default Component.extend({
  competencies: [],
  domains: computed('competencies.[]', function(){
    let defer = RSVP.defer();
    this.get('competencies').then(competencies => {
      RSVP.all(competencies.mapBy('domain')).then(domains => {
        defer.resolve(domains.uniq());
      });
    });


    return PromiseArray.create({
      promise: defer.promise
    });
  }),
});
