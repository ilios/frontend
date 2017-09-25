import Ember from 'ember';
import layout from '../templates/components/single-event';
import moment from 'moment';

const { Component, computed, inject, RSVP, isEmpty, isBlank} = Ember;
const { notEmpty } = computed;
const { service } = inject;
const { Promise, map } = RSVP;

export default Component.extend({
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

  typedLearningMaterials: computed('event.learningMaterials', function() {
    const lms = this.get('event.learningMaterials') || [];
    lms.forEach(lm => {
      if (lm.isBlanked) {
        lm['type'] = 'unknown';
        return;
      }
      if (!isBlank(lm.citation)) {
        lm['type'] = 'citation';
      } else if (!isBlank(lm.link)) {
        lm['type'] = 'link';
      } else {
        lm['type'] = 'file';
      }
    });
    return lms;
  }),

  courseLearningMaterials: computed('i18n.locale', 'typedLearningMaterials', function() {
    const eventLms = this.get('typedLearningMaterials') || [];
    return eventLms.filterBy('courseLearningMaterial').sort((lm1, lm2) => {
      let pos1 = lm1.position || 0;
      let pos2 = lm2.position || 0;

      // 1. position, asc
      if (pos1 > pos2) {
        return 1;
      } else if (pos1 < pos2) {
        return -1;
      }

      // 2. course learning material id, desc
      let id1 = lm1.courseLearningMaterial;
      let id2 = lm2.courseLearningMaterial;
      if (id1 > id2) {
        return -1;
      } else if (id1 < id2) {
        return 1;
      }
      return 0;
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

  sessionLearningMaterials: computed('i18n.locale', 'typedLearningMaterials', function() {
    const eventLms = this.get('typedLearningMaterials') || [];
    return eventLms.filterBy('sessionLearningMaterial').sort((lm1, lm2) => {
      let pos1 = lm1.position || 0;
      let pos2 = lm2.position || 0;

      // 1. position, asc
      if (pos1 > pos2) {
        return 1;
      } else if (pos1 < pos2) {
        return -1;
      }

      // 2. session learning material id, desc
      let id1 = lm1.sessionLearningMaterial;
      let id2 = lm2.sessionLearningMaterial;
      if (id1 > id2) {
        return -1;
      } else if (id1 < id2) {
        return 1;
      }
      return 0;
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
