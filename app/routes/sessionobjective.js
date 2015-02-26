import Ember from 'ember';

export default Ember.Route.extend({
  session: null,
  course: null,
  proxiedObjectives: [],
  afterModel: function(sessionObjective){
    var self = this;
    var deferred = Ember.RSVP.defer();
    var objectiveProxy = Ember.ObjectProxy.extend({
      sessionObjective: null,
      selected: function(){
        return this.get('sessionObjective.parents').contains(this.get('content'));
      }.property('content', 'sessionObjective.parents.@each'),
    });
    Ember.run.later(deferred.resolve, function() {
      var resolve = this;

      sessionObjective.get('sessions').then(function(sessions){
        var session = sessions.get('firstObject');
        session.get('course').then(function(course){
          course.get('objectives').then(function(objectives){
            var proxiedObjectives = objectives.map(function(objective){
              return objectiveProxy.create({
                content: objective,
                sessionObjective: sessionObjective,
              });
            }).sortBy('textTitle');
            if(!self.get('isDestroyed')){
              self.set('proxiedObjectives', proxiedObjectives);
              self.set('session', session);
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
    controller.set('model', model);
    controller.set('proxiedObjectives', this.get('proxiedObjectives'));
    controller.set('session', this.get('session'));
    controller.set('course', this.get('course'));
  }
});
