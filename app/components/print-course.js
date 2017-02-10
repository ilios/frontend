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

  learningMaterialSortingCallback(lm1, lm2) {
    let pos1 = lm1.get('position');
    let pos2 = lm2.get('position');
    if (pos1 > pos2) {
      return 1;
    } else if (pos1 < pos2) {
      return -1;
    }

    let id1 = lm1.get('id');
    let id2 = lm2.get('id');
    if (id1 > id2) {
      return -1;
    } else if (id1 < id2) {
      return 1;
    }
    return 0;
  },

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
              resolve(learningMaterials.toArray().sort(this.get('learningMaterialSortingCallback')));
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
        resolve(learningMaterials.toArray().sort(this.get('learningMaterialSortingCallback')));
      });
    });
  })

});
