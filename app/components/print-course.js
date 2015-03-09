import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  course: null,
  tagName: 'section',
  classNames: ['printable course'],
  sortTitle: ['title'],
  sortDirectorsBy: ['lastName', 'firstName'],
  sortedDirectors: Ember.computed.sort('course.directors', 'sortDirectorsBy'),
  sortedTopics: Ember.computed.sort('course.disciplines', 'sortTitle'),
  sortedMeshDescriptors: Ember.computed.sort('course.meshDescriptors', 'sortTitle'),
  sortedSessionProxies: function(){
    var course = this.get('course');
    if(!course){
      return [];
    }
    var deferred = Ember.RSVP.defer();
    var SessionProxy = Ember.ObjectProxy.extend({
      sortTitle: ['title'],
      sortedTopics: Ember.computed.sort('content.disciplines', 'sortTitle'),
      sortedMeshDescriptors: Ember.computed.sort('content.meshDescriptors', 'sortTitle'),
    });
    course.get('sessions').then(function(sessions){
      var proxiedSessions = sessions.map(function(session){
        return SessionProxy.create({
          content: session
        });
      });
      deferred.resolve(proxiedSessions.sortBy('title'));
    });


    return DS.PromiseArray.create({
      promise: deferred.promise
    });

  }.property('course.sessions.@each.{disciplines.@each,meshDescriptors.@each,title}'),
});
