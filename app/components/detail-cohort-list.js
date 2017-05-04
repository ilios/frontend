import Ember from 'ember';

const { Component, computed, Object:EmberObject, RSVP } = Ember;
const { all, Promise } = RSVP;

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
        let promises = [];
        let proxies = [];
        let sortedCohorts = [];
        cohorts.toArray().forEach(cohort => {
          let proxy = EmberObject.create({
            cohort,
            schoolTitle: null,
            displayTitle: null,
          });

          proxies.pushObject(proxy);

          promises.pushObject(cohort.get('displayTitle').then(displayTitle => {
            proxy.set('displayTitle', displayTitle);
          }));
          promises.pushObject(cohort.get('school').then(school => {
            proxy.set('schoolTitle', school.get('title'));
          }));
        });
        all(promises).then(() => {
          let sortedProxies = proxies.sortBy('schoolTitle', 'displayTitle');
          sortedProxies.forEach(sortedProxy => {
            sortedCohorts.pushObject(sortedProxy.get('cohort'));
          });
          resolve(sortedCohorts);
        });
      });
    });
  }),
});
