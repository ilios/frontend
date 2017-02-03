import Ember from 'ember';

const { Component, computed, RSVP } = Ember;
const { Promise } = RSVP;

export default Component.extend({

  cohorts: [],

  /**
   * A list of cohorts, sorted by school and display title.
   * @property sortedCohorts
   * @type {Ember.computed}
   * @public
   */
  sortedCohorts: computed('cohorts.@each.{school,displayTitle}', function(){
    return new Promise(resolve => {
      this.get('cohorts').then(cohorts => {
        resolve(cohorts.sortBy('school', 'displayTitle'));
      });
    });
  }),
});
