import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed, observer, on, ObjectProxy, RSVP, run } = Ember;
const { debounce } = run;
const { defer } = RSVP;
const { PromiseArray, PromiseObject } = DS;

const objectiveProxy = ObjectProxy.extend({
  sessionObjective: null,
  selected: computed('content', 'sessionObjective.parents.[]', function(){
    return this.get('sessionObjective.parents').includes(this.get('content'));
  }),
});

export default Component.extend({
  classNames: ['objective-manager'],
  sessionObjective: null,
  showObjectiveList: false,
  course: computed('sessionObjective.courses.[]', function(){
    let sessionObjective = this.get('sessionObjective');
    if(!sessionObjective){
      return null;
    }
    let deferred = defer();
    sessionObjective.get('sessions').then(function(sessions){
      let session =  sessions.get('firstObject');
      session.get('course').then(function(course){
        deferred.resolve(course);
      });
    });
    return PromiseObject.create({
      promise:deferred.promise
    });
  }),
  proxiedObjectives: computed('course', 'course.objectives.[]', function(){
    let sessionObjective = this.get('sessionObjective');
    if(!sessionObjective){
      return [];
    }
    let deferred = defer();
    this.get('course').then(function(course){
      if(!course){
        deferred.resolve([]);
      }
      course.get('objectives').then(function(objectives){
        let objectiveProxies = objectives.map(function(objective){
          return objectiveProxy.create({
            content: objective,
            sessionObjective: sessionObjective,
          });
        });
        deferred.resolve(objectiveProxies.sortBy('id'));
      });
    });
    return PromiseArray.create({
      promise: deferred.promise
    });
  }),
  watchProxiedObjectives: on('init', observer('proxiedObjectives.length', function(){
    //debounce setting showObjectiveList to avoid animating changes when
    //a save causes the proxied list to change
    debounce(this, function(){
      if(!this.get('isDestroyed')){
        this.set('showObjectiveList', this.get('proxiedObjectives.length') > 0);
      }
    }, 500);
  })),
  actions: {
    addParent: function(parentProxy){
      let newParent = parentProxy.get('content');
      let sessionObjective = this.get('sessionObjective');
      sessionObjective.get('parents').addObject(newParent);
      newParent.get('children').addObject(sessionObjective);
    },
    removeParent: function(parentProxy){
      let removingParent = parentProxy.get('content');
      let sessionObjective = this.get('sessionObjective');
      sessionObjective.get('parents').removeObject(removingParent);
      removingParent.get('children').removeObject(sessionObjective);
    }
  }
});
