import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed, inject, RSVP} = Ember;
const { service } = inject;
const { PromiseArray } = DS;
const { sort } = computed;

export default Component.extend({

  classNames: ['secondary-cohorts'],

  currentUser: service(),

  removableCohorts: computed('cohorts.[]', 'primaryCohort', function() {
    const primaryCohort = this.get('primaryCohort');
    return this.get('cohorts').filter(function(cohort) {
      if (! primaryCohort) {
        return true;
      }
      return cohort.get('id') !== primaryCohort.get('id');
    })
  }),

  assignableCohorts: computed('currentUser.cohortsInAllAssociatedSchools.[]', 'cohorts.[]', {
    get(){
      let defer = RSVP.defer();

      this.get('currentUser.cohortsInAllAssociatedSchools').then(usableCohorts => {
        let assignableCohorts = usableCohorts.filter(cohort => {
          return (
            this.get('cohorts') &&
            !this.get('cohorts').contains(cohort)
          );
        });
        defer.resolve(assignableCohorts);
      });

      return PromiseArray.create({
        promise: defer.promise
      });
    }
  }).readOnly(),

  cohortSorting: [
    'programYear.program.school.title:asc',
    'programYear.program.title:asc',
    'title:desc'
  ],
  sortedAssignableCohorts: sort('assignableCohorts', 'cohortSorting'),
  sortedRemovableCohorts: sort('removableCohorts', 'cohortSorting'),

  actions: {
    add: function(cohort){
      this.sendAction('add', cohort);
    },
    remove: function(cohort){
      this.sendAction('remove', cohort);
    }
  },
});
