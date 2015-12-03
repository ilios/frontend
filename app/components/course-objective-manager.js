import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed, observer, on } = Ember;

var competencyGroup = Ember.Object.extend({
  title: '',
  originalObjectives: [],
  uniqueObjectives: computed.uniq('originalObjectives'),
  objectiveSorting: ['title'],
  objectives: computed.sort('uniqueObjectives', 'objectiveSorting'),
  selectedObjectives: computed.filterBy('uniqueObjectives', 'selected', true),
  selected: computed.gt('selectedObjectives.length', 0),
});

var objectiveProxy = Ember.ObjectProxy.extend({
  courseObjective: null,
  selected: computed('content', 'courseObjective.parents.@each', function(){
    return this.get('courseObjective.parents').contains(this.get('content'));
  }),
});

var cohortProxy = Ember.Object.extend({
  cohort: null,
  objective: [],
  id: computed.oneWay('cohort.id'),
  title: computed('cohort.displayTitle', 'cohort.programYear.program.title', function(){
    var program = this.get('cohort.programYear.program.title');
    var cohort = this.get('cohort.displayTitle');
    if(program && cohort) {
      return program + ' ' + cohort;
    }

    return '';
  }),
  objectivesByCompetency: computed('objectives.[]', function(){
    let deferred = Ember.RSVP.defer();
    let objectives = this.get('objectives');
    let competencies = [];
    let promises = [];
    objectives.forEach(objective => {
      promises.pushObject(objective.get('competency').then(competency => {
        competencies.pushObject(competency);
      }));
    });
    Ember.RSVP.all(promises).then(() => {
      let groups = competencies.uniq().filter(competency => {
        return !!competency;
      }).map(competency => {
        let ourObjectives = objectives.filter(objective => {
          return objective.get('competency').get('id') === competency.get('id');
        });
        return competencyGroup.create({
          title: competency.get('title'),
          originalObjectives: ourObjectives
        });
      });
      deferred.resolve(groups.sortBy('title'));
    });
    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  })
});

export default Component.extend({
  classNames: ['objective-manager', 'course-objective-manager'],
  courseObjective: null,
  showObjectiveList: false,
  showCohortList: false,
  cohorts: computed(
    'courseObjective.courses.@each',
    'courseObjective.courses.@each.cohorts.length',
    function(){
      var courseObjective = this.get('courseObjective');
      var groups = [];
      if(!courseObjective){
        return [];
      }
      var deferred = Ember.RSVP.defer();
      courseObjective.get('courses').then(function(courses){
        var course = courses.get('firstObject');
        course.get('cohorts').then(function(cohorts){
          var promises = cohorts.map(function(cohort){
            return cohort.get('objectives').then(function(objectives){
              var objectiveProxies = objectives.map(function(objective){
                return objectiveProxy.create({
                  content: objective,
                  courseObjective: courseObjective,
                });
              });
              var group = cohortProxy.create({
                cohort: cohort,
                objectives: objectiveProxies
              });
              groups.pushObject(group);
            });
          });
          Ember.RSVP.all(promises).then(function(){
            deferred.resolve(groups);
          });
        });
      });
      return DS.PromiseArray.create({
        promise: deferred.promise
      });
    }
  ),
  selectedCohortId: null,
  multipleCohorts: computed.gt('availableCohorts.length', 1),
  availableCohorts: computed('cohorts.@each.id', 'cohorts.@each.title', function(){
    var cohorts = this.get('cohorts');
    if(!cohorts){
      return [];
    }
    return cohorts.map(function(cohort){
      return {
        id: cohort.get('id'),
        title: cohort.get('title')
      };
    }).sortBy('title');
  }),
  currentCohort: computed('selectedCohortId', 'cohorts.@each', function(){
    var selectedCohortId = this.get('selectedCohortId');
    if(selectedCohortId){
      var matchingGroups = this.get('cohorts').filterBy('id', selectedCohortId);
      if(matchingGroups.length > 0){
        this.set('showObjectiveList', true);
        return matchingGroups.get('firstObject');
      }
    }

    return null;
  }),
  watchCohorts: on('init', observer(
    'availableCohorts.@each',
    'selectedCohortId',
    'availableCohorts.length',
    function(){
      Ember.run.later(this, function(){
        if(this.get('selectedCohortId') == null){
          var firstCohort = this.get('availableCohorts.firstObject');
          if(firstCohort != null){
            this.set('selectedCohortId', firstCohort.id);
          }
        }
      }, 500);

      //debounce this to avoid weird saving behavior and animations
      Ember.run.debounce(this, function(){
        if(!this.get('isDestroyed')){
          this.set('showCohortList', this.get('availableCohorts.length') > 0);
        }
      }, 500);
    }
  )),
  actions: {
    addParent: function(parentProxy){
      var courseObjective = this.get('courseObjective');
      var newParent = parentProxy.get('content');

      //remove any other parents in the same cohort
      newParent.get('programYears').then(function(programYears){
        var newProgramYear = programYears.get('firstObject');
        newProgramYear.get('objectives').then(function(oldParents){
          oldParents.forEach(function(oldParent){
            if(oldParent.get('id') !== newParent.get('id')){
              courseObjective.get('parents').removeObject(oldParent);
              oldParent.get('children').removeObject(courseObjective);
            }
          });
          courseObjective.get('parents').addObject(newParent);
          newParent.get('children').addObject(courseObjective);
        });
      });
    },
    removeParent: function(parentProxy){
      var removingParent = parentProxy.get('content');
      var courseObjective = this.get('courseObjective');
      courseObjective.get('parents').removeObject(removingParent);
      removingParent.get('children').removeObject(courseObjective);
    },
    changeSelectedCohort(id){
      this.set('selectedCohortId', id);
    }
  }
});
