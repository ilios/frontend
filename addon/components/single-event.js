import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isBlank, isEmpty } from '@ember/utils';
import layout from '../templates/components/single-event';
import moment from 'moment';

export default Component.extend({
  layout,
  store: service(),
  i18n: service(),
  event: null,
  classNames: ['single-event'],

  taughtBy: computed('i18n.locale', 'event.instructors', function(){
    const instructors = this.get('event.instructors');
    if (isEmpty(instructors)) {
      return '';
    }
    return this.get('i18n').t('general.taughtBy', {instructors});
  }),

  sessionIs: computed('event.sessionType', 'i18n.locale', function(){
    const i18n = this.get('i18n');
    const type = this.get('event.sessionTypeTitle');
    return i18n.t('general.sessionIs', { type });
  }),

  courseObjectives: computed('i18n.locale', 'event.courseObjectives.[]', 'event.competencies.[]', function(){
    const i18n = this.get('i18n');
    const event = this.get('event');
    const objectives =  event.courseObjectives;
    const competencies = event.competencies;
    return objectives.map(objective => {
      //strip all HTML
      const title = objective.title.replace(/(<([^>]+)>)/ig,"");
      const position = objective.position;
      if(isEmpty(objective.competencies)) {
        return {
          id: objective.id,
          title,
          domain: i18n.t('general.noAssociatedCompetencies'),
          position
        };
      }
      const competencyId = objective.competencies[0];
      const competency = competencies.findBy('id', competencyId);
      const parentId = competency.parent;
      let domain = competency;
      if (! isEmpty(parentId)) {
        domain = competencies.findBy('id', parentId);
      }
      return {
        id: objective.id,
        title,
        domain: competency.title + ' (' + domain.title + ')',
        position
      };
    }).sort(this.positionSortingCallback);
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

  sessionObjectives: computed('i18n.locale', 'event.sessionObjectives.[]', 'event.competencies.[]', function(){
    const i18n = this.get('i18n');
    const event = this.get('event');
    const objectives =  event.sessionObjectives;
    const competencies = event.competencies;
    return objectives.map(objective => {
      //strip all HTML
      const title = objective.title.replace(/(<([^>]+)>)/ig,"");
      const position = objective.position;
      if(isEmpty(objective.competencies)) {
        return {
          id: objective.id,
          title,
          domain: i18n.t('general.noAssociatedCompetencies'),
          position
        };
      }
      const competencyId = objective.competencies[0];
      const competency = competencies.findBy('id', competencyId);
      const parentId = competency.parent;
      let domain = competency;
      if (! isEmpty(parentId)) {
        domain = competencies.findBy('id', parentId);
      }
      return {
        id: objective.id,
        title,
        domain: competency.title + ' (' + domain.title + ')',
        position
      };
    }).sort(this.positionSortingCallback);
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

  recentlyUpdated: computed('event.lastModified', function(){
    const lastModifiedDate = moment(this.get('event.lastModified'));
    const today = moment();
    const daysSinceLastUpdate = today.diff(lastModifiedDate, 'days');
    return daysSinceLastUpdate < 6;
  }),

  /**
   * Callback function for <code>Array.sort()<code>.
   * Compares two given Objects by their position property (in ascending order), and then by id (descending).
   *
   * @method positionSortingCallback
   * @param {Object} obj1
   * @param {Object} obj2
   * @return {Number}
   */
  positionSortingCallback(obj1, obj2) {
    let pos1 = obj1.position;
    let pos2 = obj2.position;
    // 1. position, asc
    if (pos1 > pos2) {
      return 1;
    } else if (pos1 < pos2) {
      return -1;
    }

    // 2. id, desc
    let id1 = obj1.id;
    let id2 = obj2.id;
    if (id1 > id2) {
      return -1;
    } else if (id1 < id2) {
      return 1;
    }
    return 0;
  },
});
