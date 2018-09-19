/* eslint ember/order-in-components: 0 */
import { sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import ObjectProxy from '@ember/object/proxy';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';

const { Promise } = RSVP;

export default Component.extend(SortableByPosition, {
  store: service(),
  init(){
    this._super(...arguments);
    this.set('sortTitle', ['title']);
    this.set('sortDirectorsBy', ['lastName', 'firstName']);
  },
  course: null,
  includeUnpublishedSessions: false,
  tagName: 'section',
  classNames: ['print-course'],
  sortTitle: null,
  sortDirectorsBy: null,
  sortedDirectors: sort('course.directors', 'sortDirectorsBy'),
  sortedMeshDescriptors: sort('course.meshDescriptors', 'sortTitle'),

  /**
   * A list of proxied course sessions, sorted by title.
   * @property sortedSessionProxies
   * @type {Ember.computed}
   * @public
   */
  sortedSessionProxies: computed('course.sessions.[]', 'includeUnpublishedSessions', function(){
    return new Promise(resolve => {

      const course = this.course;
      if(!course){
        resolve([]);
        return;
      }

      let SessionProxy = ObjectProxy.extend({
        init() {
          this._super(...arguments);
          this.set('sortTitle', ['title']);
        },
        sortTitle: null,
        sortedMeshDescriptors: sort('content.meshDescriptors', 'sortTitle'),
        sessionLearningMaterials: computed('content', function(){
          return new Promise(resolve => {
            let session = this.content.get('id');
            this.store.query('sessionLearningMaterial', {
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
        if (!this.includeUnpublishedSessions) {
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
      let course = this.course.get('id');
      this.store.query('courseLearningMaterial', {
        filters: {
          course
        }
      }).then(learningMaterials => {
        resolve(learningMaterials.toArray().sort(this.positionSortingCallback));
      });
    });
  })

});
