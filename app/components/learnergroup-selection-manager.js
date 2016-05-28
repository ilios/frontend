import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed, inject } = Ember;
const { notEmpty } = computed;
const { service } = inject;

export default Component.extend({
  i18n: service(),
  filter: '',
  sortBy: ['title'],
  cohorts: [],
  filteredCohorts: computed('cohorts.[]', 'filter', 'learnerGroups.[]', function(){
    var self = this;
    var cohortProxy = Ember.ObjectProxy.extend({
      selectedLearnerGroups: [],
      hasAvailableLearnerGroups: notEmpty('filteredAvailableLearnerGroups'),
      filter: '',
      filteredAvailableLearnerGroups: computed(
        'content.learnerGroups.[]',
        'content.learnerGroups.@each.allDescendants',
        'filter',
        'selectedLearnerGroups.[]',
        function(){
          var defer = Ember.RSVP.defer();
          var self = this;
          var filter = this.get('filter');
          var exp = new RegExp(filter, 'gi');
          var activeGroupFilter = function(learnerGroup) {
            var searchTerm = learnerGroup.get('title') + learnerGroup.get('allParentsTitle');
            return (
              learnerGroup.get('title') !== undefined &&
              self.get('selectedLearnerGroups') &&
              exp.test(searchTerm) &&
              !self.get('selectedLearnerGroups').contains(learnerGroup)
            );
          };
          this.get('content.topLevelLearnerGroups').then(function(cohortGroups){
            let learnerGroups = [];
            var promises = [];
            cohortGroups.forEach(function(learnerGroup){
              learnerGroups.pushObject(learnerGroup);
              var promise = new Ember.RSVP.Promise(function(resolve) {
                learnerGroup.get('allDescendants').then(function(descendants){
                  learnerGroups.pushObjects(descendants);
                  resolve();
                });
              });
              promises.pushObject(promise);
            });
            Ember.RSVP.all(promises).then(function(){
              defer.resolve(learnerGroups.filter(activeGroupFilter).sortBy('sortTitle'));
            });
          });
          return DS.PromiseArray.create({
            promise: defer.promise
          });
        }
      ),
    });
    var cohorts = this.get('cohorts')?this.get('cohorts'):[];
    return cohorts.map(function(cohort){
      var proxy = cohortProxy.create({
        content: cohort,
        filter: self.get('filter'),
        selectedLearnerGroups: self.get('learnerGroups')
      });
      return proxy;
    }).sortBy('title');
  }),
});
