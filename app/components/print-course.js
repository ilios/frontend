import Ember from 'ember';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';

const { Component, computed, RSVP, ObjectProxy} = Ember;
const { Promise } = RSVP;

export default Component.extend(SortableByPosition, {
  store: Ember.inject.service(),
  course: null,
  includeUnpublishedSessions: false,
  tagName: 'section',
  classNames: ['printable', 'course', 'print-course'],
  sortTitle: ['title'],
  sortDirectorsBy: ['lastName', 'firstName'],
  sortedDirectors: computed.sort('course.directors', 'sortDirectorsBy'),
  sortedMeshDescriptors: computed.sort('course.meshDescriptors', 'sortTitle'),

  /**
   * A list of proxied course sessions, sorted by title.
   * @property sortedSessionProxies
   * @type {Ember.computed}
   * @public
   */
  sortedSessionProxies: computed('course.sessions.[]', function(){
    return new Promise(resolve => {

      const course = this.get('course');
      if(!course){
        resolve([]);
        return;
      }

      let SessionProxy = ObjectProxy.extend({
        sortTitle: ['title'],
        sortedMeshDescriptors: computed.sort('content.meshDescriptors', 'sortTitle'),
        sessionLearningMaterials: computed('content', function(){
          return new Promise(resolve => {
            let session = this.get('content').get('id');
            this.get('store').query('sessionLearningMaterial', {
              filters: {
                session
              }
            }).then(learningMaterials => {
              resolve(learningMaterials.toArray().sort(this.positionSortingCallback));
            });
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
    return new Promise(resolve => {
      let course = this.get('course').get('id');
      this.get('store').query('courseLearningMaterial', {
        filters: {
          course
        }
      }).then(learningMaterials => {
        resolve(learningMaterials.toArray().sort(this.positionSortingCallback));
      });
    });
  })

});
