import Ember from 'ember';
import layout from '../templates/components/single-event';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';
import moment from 'moment';

const { Component, computed, inject, RSVP, isEmpty} = Ember;
const { notEmpty } = computed;
const { service } = inject;
const { Promise, map, resolve } = RSVP;

export default Component.extend(SortableByPosition, {
  layout,
  store: service(),
  i18n: service(),
  event: null,
  classNames: ['single-event'],
  description: computed('session.description.description', function(){
    return new Promise(resolve => {
      this.get('session').then(session=>{
        session.get('sessionDescription').then(description=>{
          if(isEmpty(description)){
            resolve(null);
          } else {
            resolve(description.get('description'));
          }
        });
      });
    });
  }),
  isOffering: notEmpty('event.offering'),
  taughtBy: computed('i18n.locale', 'event.instructors', function(){
    const instructors = this.get('event.instructors');
    if (isEmpty(instructors)) {
      return '';
    } else {
      return this.get('i18n').t('general.taughtBy', {instructors});
    }
  }),
  sessionIs: computed('session.sessionType', 'i18n.locale', function(){
    return new Promise(resolve => {
      const i18n = this.get('i18n');
      this.get('session').then(session => {
        session.get('sessionType').then(sessionType => {
          resolve(i18n.t('general.sessionIs', {type: sessionType.get('title')}));
        });
      });
    });
  }),
  offering: computed('event.offering', function(){
    const offeringId = this.get('event.offering');
    const store = this.get('store');
    return new Promise(resolve => {
      if(!offeringId){
        resolve(null);
      } else {
        store.findRecord('offering', offeringId).then(offering => {
          resolve(offering);
        });
      }
    });
  }),
  ilmSession: computed('event.ilmSession', function(){
    const ilmSessionId = this.get('event.ilmSession');
    const store = this.get('store');
    return new Promise(resolve => {
      if(!ilmSessionId){
        resolve(null);
      } else {
        store.findRecord('ilm-session', ilmSessionId).then(ilmSession => {
          resolve(ilmSession);
        });
      }
    });
  }),
  courseObjectives: computed('i18n.locale', 'course.sortedObjectives.[]', function(){
    const i18n = this.get('i18n');
    return new Promise(resolve => {
      this.get('course').then(course => {
        course.get('sortedObjectives').then(objectives => {
          map(objectives, objective => {
            return new Promise(resolve => {
              objective.get('topParents').then(parents => {
                let parent = parents.get('firstObject');
                parent.get('competency').then(competency => {
                  //strip all HTML
                  let title = objective.get('title').replace(/(<([^>]+)>)/ig,"");
                  let position = objective.get('position');
                  if(isEmpty(competency)){
                    resolve({
                      title,
                      domain: i18n.t('general.noAssociatedCompetencies'),
                      position
                    });
                  } else {
                    competency.get('domain').then(domain => {
                      resolve({
                        title,
                        domain: competency.get('title') + ' (' + domain.get('title') + ')',
                        position
                      });
                    });
                  }
                });
              });
            });
          }).then(mappedObjectives => {
            resolve(mappedObjectives);
          });
        });
      });
    });
  }),

  /**
   * Course learning materials that currently fall outside their timed release window.
   * @property blankedSessionLms
   * @type {Ember.computed}
   * @public
   */
  blankedCourseLms: computed('event.learningMaterials', function() {
    const eventLms = this.get('event.learningMaterials') || [];
    return eventLms.filter(lm => {
      return isEmpty(lm.session) && lm.isBlanked;
    });
  }),

  courseLearningMaterials: computed('i18n.locale', 'course', 'event.learningMaterials', function() {
    const eventLms = this.get('event.learningMaterials') || [];
    const nonBlankedCourseLmIds = eventLms.filter(lm => {
      return isEmpty(lm.session) && !lm.isBlanked;
    }).mapBy('id');
    if (isEmpty(nonBlankedCourseLmIds)) {
      return resolve([]);
    }
    return new Promise(resolve => {
      const store = this.get('store');
      store.query('courseLearningMaterial', {
        filters: {
          id: nonBlankedCourseLmIds
        },
      }).then((courseLearningMaterials) => {
        let sortedMaterials = courseLearningMaterials.toArray().sort(this.positionSortingCallback);
        map(sortedMaterials, clm => {
          return new Promise(resolve => {
            clm.get('learningMaterial').then(learningMaterial => {
              const { required, notes: storedNotes, publicNotes } = clm.getProperties('required', 'notes', 'publicNotes');
              const notes = publicNotes?storedNotes:'';
              const {title, description, url, type, mimetype, filesize, citation} = learningMaterial.getProperties([
                'title', 'description', 'url', 'type', 'mimetype', 'filesize', 'citation'
              ]);

              let obj = {
                title,
                description,
                required,
                notes,
                url,
                type,
                mimetype,
                filesize,
                citation,
              };

              resolve(obj);
            });
          });
        }).then(mappedLearningMaterials => {
          resolve(mappedLearningMaterials);
        });
      });
    });
  }),
  sessionObjectives: computed('i18n.locale', 'session.sortedObjectives.[]', function(){
    const i18n = this.get('i18n');
    return new Promise(resolve => {
      this.get('session').then(session => {
        session.get('sortedObjectives').then(objectives => {
          map(objectives, objective => {
            return new Promise(resolve => {
              objective.get('topParents').then(parents => {
                let parent = parents.get('firstObject');
                parent.get('competency').then(competency => {
                  //strip all HTML
                  let title = objective.get('title').replace(/(<([^>]+)>)/ig,"");
                  let position = objective.get('position');
                  if(isEmpty(competency)){
                    resolve({
                      title,
                      domain: i18n.t('general.noAssociatedCompetencies'),
                      position
                    });
                  } else {
                    competency.get('domain').then(domain => {
                      resolve({
                        title,
                        domain: competency.get('title') + ' (' + domain.get('title') + ')',
                        position
                      });
                    });
                  }
                });
              });
            });
          }).then(mappedObjectives => {
            resolve(mappedObjectives);
          });
        });
      });
    });
  }),

  /**
   * Session learning materials that currently fall outside their timed release window.
   * @property blankedSessionLms
   * @type {Ember.computed}
   * @public
   */
  blankedSessionLms: computed('event.learningMaterials', function() {
    const eventLms = this.get('event.learningMaterials') || [];
    return eventLms.filter(lm => {
      return !isEmpty(lm.session) && lm.isBlanked;
    });
  }),

  sessionLearningMaterials: computed('i18n.locale', 'session', 'event.learningMaterials', function() {
    const eventLms = this.get('event.learningMaterials') || [];
    const nonBlankedSessionLmIds = eventLms.filter(lm => {
      return !isEmpty(lm.session) && !lm.isBlanked;
    }).mapBy('id');
    if (isEmpty(nonBlankedSessionLmIds)) {
      return resolve([]);
    }
    return new Promise(resolve => {
      this.get('store').query('sessionLearningMaterial', {
        filters: {
          id: nonBlankedSessionLmIds
        },
      }).then((sessionLearningMaterials) => {
        let sortedMaterials = sessionLearningMaterials.toArray().sort(this.positionSortingCallback);
        map(sortedMaterials, slm => {
          return new Promise(resolve => {
            slm.get('learningMaterial').then(learningMaterial => {
              const { required, notes: storedNotes, publicNotes } = slm.getProperties('required', 'notes', 'publicNotes');
              const notes = publicNotes?storedNotes:'';
              const {title, description, url, type, mimetype, filesize, citation} = learningMaterial.getProperties([
                'title', 'description', 'url', 'type', 'mimetype', 'filesize', 'citation'
              ]);

              let obj = {
                title,
                description,
                required,
                notes,
                url,
                type,
                mimetype,
                filesize,
                citation,
              };

              resolve(obj);
            });
          });
        }).then(lmObjects => {
          resolve(lmObjects);
        });
      });
    });
  }),
  course: computed('session.course', function(){
    return new Promise(resolve => {
      this.get('session').then(session=>{
        session.get('course').then(course=>{
          resolve(course);
        });
      });
    });
  }),
  sessionTitle: computed('session.title', 'isOffering', function(){
    return new Promise(resolve => {
      let prefix = this.get('isOffering')?'':'ILM: ';
      this.get('session').then(session => {
        resolve(prefix + session.get('title'));
      });
    });
  }),
  session: computed('offering.session', 'ilmSession.session', function(){
    const relationship = this.get('isOffering')?'offering':'ilmSession';
    return new Promise(resolve => {
      this.get(relationship).then(related => {
        related.get('session').then(session=>{
          resolve(session);
        });
      });
    });
  }),
  recentlyUpdated: computed('lastModified', function(){
    const lastModifiedDate = moment(this.get('lastModified'));
    const today = moment();
    const daysSinceLastUpdate = today.diff(lastModifiedDate, 'days');

    return daysSinceLastUpdate < 6 ? true : false;
  }),
});
