import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { inject as service } from '@ember/service';
import { isBlank, isEmpty } from '@ember/utils';
import moment from 'moment';

const TypedLearningMaterial = ObjectProxy.extend({
  type: computed('isBlanked', 'citation', 'link', 'file', function() {
    if (this.isBlanked) {
      return 'unknown';
    }
    if (!isBlank(this.citation)) {
      return 'citation';
    } else if (!isBlank(this.link)) {
      return 'link';
    } else {
      return 'file';
    }
  })
});

export default class SingleEvent extends Component {
  @service currentUser;
  @service intl;
  @service store;
  @service router;

  get courseId() {
    return this.args.event.course;
  }

  get taughtBy() {
    const instructors = this.args.event.instructors;
    if (isEmpty(instructors)) {
      return '';
    }
    return this.intl.t('general.taughtBy', { instructors: instructors.join(', ') });
  }

  get sessionIs() {
    return this.intl.t('general.sessionIs', { type: this.args.event.sessionTypeTitle });
  }

  get courseObjectives() {
    const objectives =  this.args.event.courseObjectives || [];
    const competencies = this.args.event.competencies || [];
    return objectives.map(objective => {
      //strip all HTML
      const title = objective.title.replace(/(<([^>]+)>)/ig,"");
      const position = objective.position;
      if(isEmpty(objective.competencies)) {
        return {
          id: objective.id,
          title,
          domain: this.intl.t('general.noAssociatedCompetencies'),
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
  }

  get typedLearningMaterials() {
    const lms = this.args.event.learningMaterials || [];
    return lms.map(lm => {
      return TypedLearningMaterial.create(lm);
    });
  }

  get courseLearningMaterials() {
    const eventLms = this.typedLearningMaterials;
    return eventLms.filterBy('courseLearningMaterial').sort((lm1, lm2) => {
      const pos1 = parseInt(lm1.position, 10) || 0;
      const pos2 = parseInt(lm2.position, 10) || 0;

      // 1. position, asc
      if (pos1 > pos2) {
        return 1;
      } else if (pos1 < pos2) {
        return -1;
      }

      // 2. course learning material id, desc
      const id1 = lm1.courseLearningMaterial;
      const id2 = lm2.courseLearningMaterial;
      if (id1 > id2) {
        return -1;
      } else if (id1 < id2) {
        return 1;
      }
      return 0;
    });
  }

  get sessionObjectives() {
    const objectives =  this.args.event.sessionObjectives || [];
    const competencies = this.args.event.competencies || [];
    return objectives.map(objective => {
      //strip all HTML
      const title = objective.title.replace(/(<([^>]+)>)/ig,"");
      const position = objective.position;
      if(isEmpty(objective.competencies)) {
        return {
          id: objective.id,
          title,
          domain: this.intl.t('general.noAssociatedCompetencies'),
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
  }

  get sessionLearningMaterials() {
    const eventLms = this.typedLearningMaterials;
    return eventLms.filterBy('sessionLearningMaterial').sort((lm1, lm2) => {
      const pos1 = parseInt(lm1.position, 10) || 0;
      const pos2 = parseInt(lm2.position, 10) || 0;

      // 1. position, asc
      if (pos1 > pos2) {
        return 1;
      } else if (pos1 < pos2) {
        return -1;
      }

      // 2. session learning material id, desc
      const id1 = lm1.sessionLearningMaterial;
      const id2 = lm2.sessionLearningMaterial;
      if (id1 > id2) {
        return -1;
      } else if (id1 < id2) {
        return 1;
      }
      return 0;
    });
  }

  get recentlyUpdated() {
    const lastModifiedDate = moment(this.args.event.lastModified);
    const today = moment();
    const daysSinceLastUpdate = today.diff(lastModifiedDate, 'days');
    return daysSinceLastUpdate < 6;
  }

  get postrequisiteLink() {
    if (this.args.event.postrequisites.length) {
      return this.router.urlFor('events', this.args.event.postrequisites[0].slug);
    }

    return '';
  }

  @action
  transitionToMyMaterials() {
    const course = this.courseId;
    const queryParams = { course, sortBy: 'sessionTitle' };
    this.router.transitionTo('mymaterials', { queryParams });
  }

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
    const pos1 = obj1.position;
    const pos2 = obj2.position;
    // 1. position, asc
    if (pos1 > pos2) {
      return 1;
    } else if (pos1 < pos2) {
      return -1;
    }

    // 2. id, desc
    const id1 = obj1.id;
    const id2 = obj2.id;
    if (id1 > id2) {
      return -1;
    } else if (id1 < id2) {
      return 1;
    }
    return 0;
  }
}
