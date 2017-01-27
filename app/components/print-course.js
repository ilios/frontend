import Ember from 'ember';

const { Component, computed, RSVP, ObjectProxy, inject } = Ember;
const { Promise } = RSVP;
const { service } = inject;

export default Component.extend({
  store: service(),
  course: null,
  includeUnpublishedSessions: false,
  tagName: 'section',
  classNames: ['printable course'],
  sortTitle: ['title'],
  sortDirectorsBy: ['lastName', 'firstName'],
  sortedDirectors: computed.sort('course.directors', 'sortDirectorsBy'),
  sortedMeshDescriptors: computed.sort('course.meshDescriptors', 'sortTitle'),
  sortedSessionProxies: computed('course.sessions.[]', function(){
    return new Promise(resolve => {

      const course = this.get('course');
      if(!course){
        return [];
      }

      let SessionProxy = ObjectProxy.extend({
        sortTitle: ['title'],
        sortedMeshDescriptors: computed.sort('content.meshDescriptors', 'sortTitle'),
        sessionLearningMaterials: computed('content', function(){
          let session = this.get('content').get('id');
          return this.get('store').query('sessionLearningMaterial', {
            filters: {
              session
            }
          });
        })
      });
      course.get('sessions').then(sessions => {
        if (!this.get('includeUnpublishedSessions')) {
          sessions = sessions.filterBy('isPublishedOrScheduled');
        }
        let proxiedSessions = sessions.map(function(session){
          return SessionProxy.create({
            content: session
          });
        });
        resolve(proxiedSessions.sortBy('title'));
      });

    });
  }),

  courseLearningMaterials: computed('course', function(){
    let course = this.get('course').get('id');
    return this.get('store').query('courseLearningMaterial', {
      filters: {
        course
      }
    });
  }),

});
