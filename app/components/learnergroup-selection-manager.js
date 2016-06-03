import Ember from 'ember';

const { Component, computed, isEmpty, inject, RSVP } = Ember;
const { service } = inject;
const { Promise, all } = RSVP;

export default Component.extend({
  i18n: service(),
  filter: '',
  sortBy: ['title'],
  cohorts: [],
  learnerGroups: [],
  allLearnerGroups: computed('cohorts.[]', function(){
    return new Promise(resolve => {
      const cohorts = this.get('cohorts');
      if (isEmpty(cohorts)) {
        resolve([]);
      } else {
        all(cohorts.mapBy('topLevelLearnerGroups')).then(allLearnerGroups => {
          let flat = allLearnerGroups.reduce((flattened, arr) => {
            return flattened.pushObjects(arr);
          }, []);

          resolve(flat);
        });
      }

    });

  }),
  actions: {
    compareCohorts(cohort, cohortPromise){
      return cohort === cohortPromise.get('content');
    }
  }
});
