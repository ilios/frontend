import Ember from 'ember';
import DS from 'ember-data';

var objectiveProxy = Ember.ObjectProxy.extend({
  sessionObjective: null,
  selected: function(){
    return this.get('sessionObjective.parents').contains(this.get('content'));
  }.property('content', 'sessionObjective.parents.@each'),
});

export default Ember.Component.extend({
  classNames: ['objective-manager'],
  sessionObjective: null,
  showObjectiveList: false,
  course: function(){
    var sessionObjective = this.get('sessionObjective');
    if(!sessionObjective){
      return null;
    }
    var deferred = Ember.RSVP.defer();
    sessionObjective.get('sessions').then(function(sessions){
      var session =  sessions.get('firstObject');
      session.get('course').then(function(course){
        deferred.resolve(course);
      });
    });
    return DS.PromiseObject.create({
      promise:deferred.promise
    });
  }.property('sessionObjective.courses.@each'),
  proxiedObjectives: function(){
    var sessionObjective = this.get('sessionObjective');
    if(!sessionObjective){
      return [];
    }
    var deferred = Ember.RSVP.defer();
    this.get('course').then(function(course){
      if(!course){
        deferred.resolve([]);
      }
      course.get('objectives').then(function(objectives){
        var objectiveProxies = objectives.map(function(objective){
          return objectiveProxy.create({
            content: objective,
            sessionObjective: sessionObjective,
          });
        });
        deferred.resolve(objectiveProxies.sortBy('id'));
      });
    });
    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }.property('course', 'course.objectives.@each'),
  watchProxiedObjectives: function(){
    //debounce setting showObjectiveList to avoid animating changes when
    //a save causes the proxied list to change
    Ember.run.debounce(this, function(){
      if(!this.get('isDestroyed')){
        this.set('showObjectiveList', this.get('proxiedObjectives.length') > 0);
      }
    }, 500);
  }.observes('proxiedObjectives.length').on('init'),
  actions: {
    addParent: function(parentProxy){
      var newParent = parentProxy.get('content');
      var sessionObjective = this.get('sessionObjective');
      sessionObjective.get('parents').addObject(newParent);
      newParent.get('children').addObject(sessionObjective);
    },
    removeParent: function(parentProxy){
      var removingParent = parentProxy.get('content');
      var sessionObjective = this.get('sessionObjective');
      sessionObjective.get('parents').removeObject(removingParent);
      removingParent.get('children').removeObject(sessionObjective);
    }
  }
});
