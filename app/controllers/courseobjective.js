import Ember from 'ember';
import ObjectiveGroup from 'ilios/mixins/parent-objective-group';

export default Ember.Controller.extend({
  course: null,
  objectiveGroups: [],
  watchCohorts: function(){
    var self = this;
    var groups = [];
    var objectiveGroup = Ember.Object.extend(ObjectiveGroup, {
      cohort: null,
      title: Ember.computed.oneWay('cohort.displayTitle')
    });

    this.get('course.cohorts').then(function(cohorts){
      cohorts.forEach(function(cohort){
        cohort.get('objectives').then(function(objectives){
          self.get('model').get('parents').then(function(parents){
            var objectiveProxies = objectives.map(function(objective){
              return Ember.ObjectProxy.create({
                content: objective,
                selected: parents.contains(objective)
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
    });
  }.observes('course.cohorts.@each', 'model.parents.@each')
});
