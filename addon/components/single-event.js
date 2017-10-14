import Ember from 'ember';
import layout from '../templates/components/single-event';
import moment from 'moment';

const { Component, computed, inject, RSVP, isEmpty, isBlank} = Ember;
const { notEmpty } = computed;
const { service } = inject;
const { map, resolve } = RSVP;

export default Component.extend({
  layout,
  store: service(),
  i18n: service(),
  event: null,
  classNames: ['single-event'],

  description: computed('session.sessionDescription.description', async function(){
    const session = await this.get('session');
    const description = await session.get('sessionDescription');
    if (isEmpty(description)) {
      return null;
    }
    return description.get('description');
  }),

  isOffering: notEmpty('event.offering'),

  taughtBy: computed('i18n.locale', 'event.instructors', function(){
    const instructors = this.get('event.instructors');
    if (isEmpty(instructors)) {
      return '';
    }
    return this.get('i18n').t('general.taughtBy', {instructors});
  }),

  sessionIs: computed('session.sessionType', 'i18n.locale', async function(){
    const i18n = this.get('i18n');
    const session = await this.get('session');
    const sessionType = await session.get('sessionType');
    return i18n.t('general.sessionIs', { type: sessionType.get('title') });
  }),

  offering: computed('event.offering', async function(){
    const offeringId = this.get('event.offering');
    const store = this.get('store');
    if(!offeringId){
      return resolve(null);
    }
    return await store.findRecord('offering', offeringId);
  }),

  ilmSession: computed('event.ilmSession', async function(){
    const ilmSessionId = this.get('event.ilmSession');
    const store = this.get('store');
    if(!ilmSessionId) {
      resolve(null);
    }
    return await store.findRecord('ilm-session', ilmSessionId);
  }),
  courseObjectives: computed('i18n.locale', 'course.sortedObjectives.[]', async function(){
    const i18n = this.get('i18n');
    const course = await this.get('course');
    const objectives = await course.get('sortedObjectives');
    return await map(objectives, async objective => {
      const parents = await objective.get('topParents');
      const parent = parents.get('firstObject');
      const competency = await parent.get('competency');
      //strip all HTML
      const title = objective.get('title').replace(/(<([^>]+)>)/ig,"");
      const position = objective.get('position');
      if(isEmpty(competency)) {
        return {
          title,
          domain: i18n.t('general.noAssociatedCompetencies'),
          position
        };
      }
      const domain = await competency.get('domain');
      return {
        title,
        domain: competency.get('title') + ' (' + domain.get('title') + ')',
        position
      };
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

  sessionObjectives: computed('i18n.locale', 'session.sortedObjectives.[]', async function(){
    const i18n = this.get('i18n');
    const session = await this.get('session');
    const objectives = await session.get('sortedObjectives');
    return await map(objectives, async objective => {
      const parents = await objective.get('topParents');
      const parent =  parents.get('firstObject');
      const competency = await parent.get('competency');
      //strip all HTML
      let title = objective.get('title').replace(/(<([^>]+)>)/ig,"");
      let position = objective.get('position');
      if(isEmpty(competency)) {
        return {
          title,
          domain: i18n.t('general.noAssociatedCompetencies'),
          position
        };
      }
      const domain = await competency.get('domain');
      return {
        title,
        domain: competency.get('title') + ' (' + domain.get('title') + ')',
        position
      };
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

  course: computed('session.course', async function(){
    const session = await this.get('session');
    return await session.get('course');
  }),

  sessionTitle: computed('session.title', 'isOffering', async function(){
    let prefix = this.get('isOffering')?'':'ILM: ';
    const session = await this.get('session');
    return (prefix + session.get('title'));
  }),

  session: computed('offering.session', 'ilmSession.session', async function(){
    const relationship = this.get('isOffering') ? 'offering' : 'ilmSession';
    const related = await this.get(relationship);
    return await related.get('session');
  }),

  recentlyUpdated: computed('lastModified', function(){
    const lastModifiedDate = moment(this.get('lastModified'));
    const today = moment();
    const daysSinceLastUpdate = today.diff(lastModifiedDate, 'days');
    return daysSinceLastUpdate < 6;
  }),
});
