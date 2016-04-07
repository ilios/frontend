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

  useableCohorts: computed({
    get() {
      let defer = RSVP.defer();
      this.get('currentUser.model').then(user => {
        user.get('schools').then(schools => {
          RSVP.all(schools.mapBy('programs')).then(programsArrays => {
            let programs = [];
            programsArrays.forEach(arr => {
              arr.forEach(program => {
                programs.push(program);
              });
            });
            RSVP.all(programs.mapBy('programYears')).then(programYearsArrays => {
              let programYears = [];
              programYearsArrays.forEach(arr => {
                arr.forEach(programYear => {
                  programYears.push(programYear);
                });
              });
              RSVP.all(programYears.mapBy('cohort')).then(cohorts => {
                defer.resolve(cohorts);
              });
            });
          });
        });
      });

      return PromiseArray.create({
        promise: defer.promise
      });
    }
  }).readOnly(),

  assignableCohorts: computed('useableCohorts.[]', 'cohorts.[]', {
    get(){
      let defer = RSVP.defer();

      this.get('useableCohorts').then(useableCohorts => {
        let assignableCohorts = useableCohorts.filter(cohort => {
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
