import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed, RSVP, ObjectProxy } = Ember;
const { PromiseArray } = DS;

export default Component.extend({
  course: null,
  tagName: 'section',
  classNames: ['printable course'],
  sortTitle: ['title'],
  sortDirectorsBy: ['lastName', 'firstName'],
  sortedDirectors: computed.sort('course.directors', 'sortDirectorsBy'),
  sortedTopics: computed.sort('course.topics', 'sortTitle'),
  sortedMeshDescriptors: computed.sort('course.meshDescriptors', 'sortTitle'),
  sortedSessionProxies: computed('course.sessions.[]', function(){
    const course = this.get('course');
    if(!course){
      return [];
    }
    let deferred = RSVP.defer();
    let SessionProxy = ObjectProxy.extend({
      sortTitle: ['title'],
      sortedTopics: computed.sort('content.topics', 'sortTitle'),
      sortedMeshDescriptors: computed.sort('content.meshDescriptors', 'sortTitle'),
    });
    course.get('sessions').then(function(sessions){
      let noDraftSessions = sessions.filterBy('isPublishedOrScheduled');
      let proxiedSessions = noDraftSessions.map(function(session){
        return SessionProxy.create({
          content: session
        });
      });
      deferred.resolve(proxiedSessions.sortBy('title'));
    });


    return PromiseArray.create({
      promise: deferred.promise
    });

  }),
});
