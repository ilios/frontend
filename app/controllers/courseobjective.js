import Ember from 'ember';
import ObjectiveGroup from 'ilios/mixins/parent-objective-group';

export default Ember.Controller.extend({
  objective: Ember.computed.alias('model'),
  //course objectives are only linked to a single course
  course: Ember.computed.alias('objective.course'),
  objectiveGroups: [],
  watchCohorts: function(){
    var self = this;
    var groups = [];
    var courseObjective = this.get('objective');
    var objectiveGroup = Ember.Object.extend(ObjectiveGroup, {
      cohort: null,
      id: Ember.computed.oneWay('cohort.id'),
      title: function(){
        var program = this.get('cohort.programYear.program.title');
        var cohort = this.get('cohort.displayTitle');
        if(program && cohort) {
          return program + ' ' + cohort;
        }

        return '';
      }.property('cohort.displayTitle', 'cohort.programYear.program.title')
    });
    var objectiveProxy = Ember.ObjectProxy.extend({
      courseObjective: null,
      selected: function(){
        return this.get('courseObjective.parents').contains(this.get('content'));
      }.property('content', 'courseObjective.parents.@each'),
    });
    var course = this.get('course');
    if(course){
      this.get('course.cohorts').then(function(cohorts){
        cohorts.forEach(function(cohort){
          cohort.get('objectives').then(function(objectives){
            var objectiveProxies = objectives.map(function(objective){
              return objectiveProxy.create({
                content: objective,
                courseObjective: courseObjective,
              });
            });
            var group = objectiveGroup.create({
              cohort: cohort,
              objectives: objectiveProxies
            });
            groups.pushObject(group);
            self.set('objectiveGroups', groups);
          });
        });
      });
    }
  }.observes('objective', 'course', 'course.cohorts.@each', 'objective.parents.@each'),
  actions: {
    addParent: function(parentProxy){
      var newParent = parentProxy.get('content');
      var self = this;
      var courseObjective = this.get('objective');
      courseObjective.get('parents').then(function(ourParents){
        newParent.get('children').then(function(newParentChildren){
          ourParents.forEach(function(aParent){
            aParent.get('children').removeObject(courseObjective);
            aParent.save();
          });
          newParentChildren.addObject(courseObjective);
          newParent.save().then(function(newParent){
            ourParents.addObject(newParent);
            courseObjective.save().then(function(objective){
              self.set('objective', objective);
            });
          });
        });
      });
    },
    removeParent: function(){
      var self = this;
      var courseObjective = this.get('objective');
      courseObjective.get('parents').then(function(ourParents){
        ourParents.forEach(function(aParent){
          aParent.get('children').removeObject(courseObjective);
          aParent.save();
        });
        courseObjective.save().then(function(objective){
          self.set('objective', objective);
        });
      });
    }
  }
});
