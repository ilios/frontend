import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank, isEmpty } from '@ember/utils';
import moment from 'moment';

export default class SingleEvent extends Component {
  @service currentUser;
  @service intl;
  @service store;
  @service router;

  @tracked isSessionMaterialsListExpanded = true;
  @tracked isCourseMaterialsListExpanded = false;

  get courseId() {
    return this.args.event.course;
  }

  get startsAndEndsOnSameDay() {
    const startDate = new Date(this.args.event.startDate);
    const endDate = new Date(this.args.event.endDate);
    return (
      startDate.getDate() === endDate.getDate() &&
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth()
    );
  }

  get taughtBy() {
    const instructors = this.args.event.instructors;
    if (isEmpty(instructors)) {
      return '';
    }
    return this.intl.t('general.taughtBy', {
      instructors: instructors.join(', '),
    });
  }

  get sessionIs() {
    return this.intl.t('general.sessionIs', {
      type: this.args.event.sessionTypeTitle,
    });
  }

  get courseObjectives() {
    const objectives = this.args.event.courseObjectives || [];
    const competencies = this.args.event.competencies || [];
    return objectives
      .map((objective) => {
        const position = objective.position;
        if (isEmpty(objective.competencies)) {
          return {
            id: objective.id,
            title: objective.title,
            domain: this.intl.t('general.noAssociatedCompetencies'),
            position,
          };
        }
        const competencyId = objective.competencies[0];
        const competency = competencies.findBy('id', competencyId);
        const parentId = competency.parent;
        let domain = competency;
        if (!isEmpty(parentId)) {
          domain = competencies.findBy('id', parentId);
        }
        return {
          id: objective.id,
          title: objective.title,
          domain: competency.title + ' (' + domain.title + ')',
          position,
        };
      })
      .sort(this.positionSortingCallback);
  }

  get typedLearningMaterials() {
    const lms = this.args.event.learningMaterials || [];
    return this.getTypedLearningMaterialProxies(lms);
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
    const objectives = this.args.event.sessionObjectives || [];
    const competencies = this.args.event.competencies || [];
    return objectives
      .map((objective) => {
        const position = objective.position;
        if (isEmpty(objective.competencies)) {
          return {
            id: objective.id,
            title: objective.title,
            domain: this.intl.t('general.noAssociatedCompetencies'),
            position,
          };
        }
        const competencyId = objective.competencies[0];
        const competency = competencies.findBy('id', competencyId);
        const parentId = competency.parent;
        let domain = competency;
        if (!isEmpty(parentId)) {
          domain = competencies.findBy('id', parentId);
        }
        return {
          id: objective.id,
          title: objective.title,
          domain: competency.title + ' (' + domain.title + ')',
          position,
        };
      })
      .sort(this.positionSortingCallback);
  }

  get sessionLearningMaterials() {
    const eventLms = this.typedLearningMaterials;
    return eventLms
      .filterBy('sessionLearningMaterial')
      .sort(this.sessionLearningMaterialSortingCalling);
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

  get canViewCourse() {
    return this.currentUser.performsNonLearnerFunction;
  }

  get sessionRouteExists() {
    try {
      this.router.urlFor('session', this.args.event.course, this.args.event.session);
    } catch (e) {
      return false;
    }
    return true;
  }

  get canViewSession() {
    return this.currentUser.performsNonLearnerFunction;
  }

  @action
  transitionToMyMaterials() {
    this.router.transitionTo('dashboard.materials', {
      queryParams: {
        show: 'materials',
        course: this.courseId,
        showAll: true,
      },
    });
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

  getTypedLearningMaterialProxies(learningMaterials) {
    const lms = learningMaterials || [];
    const handler = {
      get: function (obj, prop) {
        if ('type' === prop) {
          if (obj.isBlanked) {
            return 'unknown';
          }
          if (!isBlank(obj.citation)) {
            return 'citation';
          } else if (!isBlank(obj.link)) {
            return 'link';
          } else {
            return 'file';
          }
        }
        return obj[prop];
      },
    };

    return lms.map((lm) => {
      return new Proxy(lm, handler);
    });
  }

  sessionLearningMaterialSortingCalling(lm1, lm2) {
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
  }
}
