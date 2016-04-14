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

  availableCohorts: computed('currentUser.cohortsInAllAssociatedSchools.[]', 'selectedCohorts.[]', {
    get(){
      let defer = RSVP.defer();

      this.get('currentUser.cohortsInAllAssociatedSchools').then(usableCohorts => {
        let availableCohorts = usableCohorts.filter(cohort => {
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
