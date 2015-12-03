import Ember from 'ember';
import DS from 'ember-data';

import { translationMacro as t } from "ember-i18n";

const { Component, computed, inject, RSVP} = Ember;
const { service } = inject;
const { PromiseArray } = DS;
const { sort } = computed;

export default Component.extend({
  i18n: service(),
  currentUser: service(),
  tagName: 'section',
  classNames: ['detail-block'],
  placeholder: t('general.filterPlaceholder'),
  filter: '',
  selectedCohorts: [],
  sortBy: ['title'],
  sortedCohorts: sort('selectedCohorts', 'sortBy'),
  useableCohorts: computed({
    get() {
      let defer = RSVP.defer();
      this.get('currentUser.model').then(user => {
        user.get('schools').then(schools => {
          RSVP.all(schools.mapBy('programs')).then(programsArrays => {
            //@todo there has to be a better way of doing this [JJ 11/2015]
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
  availableCohorts: computed('useableCohorts.[]', 'selectedCohorts.[]', {
    get(){
      let defer = RSVP.defer();

      this.get('useableCohorts').then(useableCohorts => {
        let availableCohorts = useableCohorts.filter(cohort => {
          return (
            this.get('selectedCohorts') &&
            !this.get('selectedCohorts').contains(cohort)
          );
        });
        defer.resolve(availableCohorts);
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
  sortedAvailableCohorts: sort('availableCohorts', 'cohortSorting'),
  actions: {
    add: function(cohort){
      this.sendAction('add', cohort);
    },
    remove: function(cohort){
      this.sendAction('remove', cohort);
    }
  }
});
