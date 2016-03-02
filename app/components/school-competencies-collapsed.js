import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed, RSVP } = Ember;
const { alias } = computed;
const { PromiseArray } = DS;

export default Component.extend({
  school: null,
  competencies: alias('school.competencies'),
  domains: computed('competencies.[]', function(){
    let defer = RSVP.defer();
    this.get('competencies').then(competencies => {
      RSVP.all(competencies.mapBy('domain')).then(domains => {
        defer.resolve(domains.uniq().sortBy('title'));
      });
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),
});
