import Ember from 'ember';
import DS from 'ember-data';

var competencyGroup = Ember.Object.extend({
  title: '',
  originalObjectives: [],
  uniqueObjectives: Ember.computed.uniq('originalObjectives'),
  objectiveSorting: ['title'],
  objectives: Ember.computed.sort('uniqueObjectives', 'objectiveSorting'),
  selectedObjectives: Ember.computed.filterBy('uniqueObjectives', 'selected', true),
  selected: Ember.computed.gt('selectedObjectives.length', 0),
});

var objectiveProxy = Ember.ObjectProxy.extend({
  courseObjective: null,
  selected: function(){
    return this.get('courseObjective.parents').contains(this.get('content'));
  }.property('content', 'courseObjective.parents.@each'),
});

var cohortProxy = Ember.Object.extend({
  cohort: null,
  objective: [],
  id: Ember.computed.oneWay('cohort.id'),
  title: function(){
    var program = this.get('cohort.programYear.program.title');
    var cohort = this.get('cohort.displayTitle');
    if(program && cohort) {
      return program + ' ' + cohort;
    }

    return '';
  }.property('cohort.displayTitle', 'cohort.programYear.program.title'),
  objectivesByCompetency: function(){
    var deferred = Ember.RSVP.defer();

    var objectives = this.get('objectives');
    var promises = this.get('objectives').mapBy('competency');

    Ember.RSVP.hash(promises).then(function(hash){
      var competencies = [];
      for(var i in hash){
        competencies.pushObject(hash[i]);
      }
      var groups = competencies.uniq().map(function(competency){
        var ourObjectives = objectives.filter(function(objective){
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
  }.property('objectives.@each')
});

export default Ember.Component.extend({
  classNames: ['objective-manager'],
  courseObjective: null,
  showObjectiveList: false,
  showCohortList: false,
  cohorts: function(){
    var courseObjective = this.get('courseObjective');
    if(!courseObjective){
      return [];
    }
    var deferred = Ember.RSVP.defer();
    var groups = [];
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
  }.property('courseObjective.courses.@each', 'courseObjective.courses.@each.cohorts.length'),
  selectedCohortId: null,
  multipleCohorts: Ember.computed.gt('availableCohorts.length', 1),
  availableCohorts: function(){
    return this.get('cohorts').map(function(cohort){
      return {
        id: cohort.get('id'),
        title: cohort.get('title')
      };
    }).sortBy('title');
  }.property('cohorts.@each.id', 'cohorts.@each.title'),
  currentCohort: function(){
    var selectedCohortId = this.get('selectedCohortId');
    if(selectedCohortId){
      var matchingGroups = this.get('cohorts').filterBy('id', selectedCohortId);
      if(matchingGroups.length > 0){
        this.set('showObjectiveList', true);
        return matchingGroups.get('firstObject');
      }
    }

    return null;
  }.property('selectedCohortId', 'cohorts.@each'),
  watchCohorts: function(){
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
      this.set('showCohortList', this.get('availableCohorts.length') > 0);
    }, 500);
  }.observes('availableCohorts.@each', 'selectedCohortId', 'availableCohorts.length').on('init'),
  actions: {
    addParent: function(parentProxy){
      var newParent = parentProxy.get('content');
      var self = this;
      var courseObjective = this.get('courseObjective');
      courseObjective.get('parents').then(function(ourParents){
        newParent.get('children').then(function(newParentChildren){
          ourParents.forEach(function(aParent){
            aParent.get('children').removeObject(courseObjective);
            aParent.save();
          });
          newParentChildren.addObject(courseObjective);
          newParent.save().then(function(newParent){
            ourParents.addObject(newParent);
            courseObjective.save().then(function(courseObjective){
              self.set('model', courseObjective);
            });
          });
        });
      });
    },
    removeParent: function(){
      var self = this;
      var courseObjective = this.get('courseObjective');
      courseObjective.get('parents').then(function(ourParents){
        ourParents.forEach(function(aParent){
          aParent.get('children').removeObject(courseObjective);
          aParent.save();
        });
        courseObjective.save().then(function(courseObjective){
          self.set('model', courseObjective);
        });
      });
    }
  }
});
