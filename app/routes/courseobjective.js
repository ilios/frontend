import Ember from 'ember';
import ObjectiveGroup from 'ilios/mixins/parent-objective-group';

export default Ember.Route.extend({
  objectiveGroups: [],
  course: null,
  afterModel: function(courseObjective){
    var self = this;
    var deferred = Ember.RSVP.defer();
    Ember.run.later(deferred.resolve, function() {
      var resolve = this;
      var groups = [];
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
              var group = objectiveGroup.create({
                cohort: cohort,
                objectives: objectiveProxies
              });
              groups.pushObject(group);
            });

          });
          Ember.RSVP.all(promises).then(function(){
            if(!self.get('isDestroyed')){
              self.set('objectiveGroups', groups);
              self.set('course', course);
              resolve();
            }
          });
        });
      });
    }, 500);

    return deferred.promise;
  },
  setupController: function(controller, model){
    var self = this;
    Ember.run.later(function(){
      if(!controller.get('isDestroyed')){
        controller.set('model', model);
        controller.set('objectiveGroups', self.get('objectiveGroups'));
        controller.set('course', self.get('course'));
      }
    });
  }
});
