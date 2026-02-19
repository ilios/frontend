import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { DateTime } from 'luxon';
import { findById } from 'ilios-common/utils/array-helpers';
import createTypedLearningMaterialProxy from 'ilios-common/utils/create-typed-learning-material-proxy';
import { TrackedAsyncData } from 'ember-async-data';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import t from 'ember-intl/helpers/t';
import { and, eq, gt, not } from 'ember-truth-helpers';
import { LinkTo } from '@ember/routing';
import { array, get } from '@ember/helper';
import objectAt from 'ilios-common/helpers/object-at';
import formatDate from 'ember-intl/helpers/format-date';
import OfferingUrlDisplay from 'ilios-common/components/offering-url-display';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import add from 'ember-math-helpers/helpers/add';
import SingleEventLearningmaterialList from 'ilios-common/components/single-event-learningmaterial-list';
import SingleEventObjectiveList from 'ilios-common/components/single-event-objective-list';
import NotFound from 'ilios-common/components/not-found';
import { htmlSafe } from '@ember/template';
import { pageTitle } from 'ember-page-title';
import {
  faBoxArchive,
  faCalendarCheck,
  faCalendarMinus,
  faCircleExclamation,
  faClock,
  faFileSignature,
  faFlask,
  faCaretRight,
  faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
import { faBlackTie } from '@fortawesome/free-brands-svg-icons';

export default class SingleEvent extends Component {
  @service currentUser;
  @service intl;
  @service store;
  @service router;

  @tracked isSessionMaterialsListExpanded = true;
  @tracked isCourseMaterialsListExpanded = false;

  userIsStudentData = new TrackedAsyncData(this.currentUser.getIsStudent());

  @cached
  get userIsStudent() {
    return this.userIsStudentData.isResolved ? this.userIsStudentData.value : false;
  }

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
        const competency = findById(competencies, competencyId);
        const parentId = competency.parent;
        let domain = competency;
        if (!isEmpty(parentId)) {
          domain = findById(competencies, parentId);
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
    return eventLms
      .filter((lm) => Boolean(lm.courseLearningMaterial))
      .sort((lm1, lm2) => {
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
        const competency = findById(competencies, competencyId);
        const parentId = competency.parent;
        let domain = competency;
        if (!isEmpty(parentId)) {
          domain = findById(competencies, parentId);
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
      .filter((lm) => Boolean(lm.sessionLearningMaterial))
      .sort(this.sessionLearningMaterialSortingCalling);
  }

  get preworkMaterials() {
    if (!this.args.event.prerequisites) {
      return [];
    }
    return this.args.event.prerequisites.map((ev) => {
      const rhett = {
        name: ev.name,
        slug: ev.slug,
        learningMaterials: [],
        isPublished: ev.isPublished,
      };
      rhett.learningMaterials = this.getTypedLearningMaterialProxies(ev.learningMaterials)
        .filter((lm) => Boolean(lm.sessionLearningMaterial))
        .sort(this.sessionLearningMaterialSortingCalling);
      return rhett;
    });
  }

  get recentlyUpdated() {
    const lastModifiedDate = DateTime.fromISO(this.args.event.lastModified);
    const today = DateTime.now();
    const daysSinceLastUpdate = today.diff(lastModifiedDate, 'days').days;
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
    } catch {
      return false;
    }
    return true;
  }

  get canViewSession() {
    return this.currentUser.performsNonLearnerFunction;
  }

  get sessionDescription() {
    return htmlSafe(this.args.event.sessionDescription);
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

  getTypedLearningMaterialProxies(lms) {
    return lms.map((lm) => {
      return createTypedLearningMaterialProxy(lm);
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
  <template>
    {{pageTitle " | " (t "general.event") ": " @event.slug prepend=false}}

    <div class="single-event main-section" data-test-single-event>
      {{#if @event}}
        <div class="single-event-summary" data-test-summary>
          <h2 data-test-header>
            {{#if this.recentlyUpdated}}
              <FaIcon
                @icon={{faCircleExclamation}}
                @title={{t "general.newUpdates"}}
                class="recently-updated-icon-event"
                data-test-recently-updated-icon
              />
            {{/if}}
            {{#if (not @event.isPublished)}}
              <FaIcon
                @icon={{faFileSignature}}
                @title={{t "general.notPublished"}}
                data-test-draft-icon
              />
            {{else if @event.isScheduled}}
              <FaIcon @icon={{faClock}} @title={{t "general.scheduled"}} data-test-scheduled-icon />
            {{/if}}
            <span data-test-header-title>
              {{@event.courseTitle}}
              -
              <em>
                {{#if (and this.sessionRouteExists this.canViewSession)}}
                  <LinkTo
                    @route="session"
                    @models={{array @event.course @event.session}}
                  >{{@event.name}}</LinkTo>
                {{else}}
                  {{@event.name}}
                {{/if}}
              </em>
            </span>
          </h2>
          <div class="single-event-offered-at" data-test-offered-at>
            {{#if (gt @event.postrequisites.length 0)}}
              <span>
                {{t "general.dueBefore"}}
                <a href={{this.postrequisiteLink}}>{{get
                    (objectAt 0 @event.postrequisites)
                    "name"
                  }}</a>
                ({{formatDate
                  (get (objectAt 0 @event.postrequisites) "startDate")
                  month="long"
                  weekday="long"
                  day="numeric"
                  year="numeric"
                  hour12=true
                  hour="2-digit"
                  minute="2-digit"
                }})
              </span>
            {{/if}}
            {{#unless @event.ilmSession}}
              <span>
                {{#if (eq @event.startDate @event.endDate)}}
                  {{formatDate
                    @event.startDate
                    month="long"
                    weekday="long"
                    day="numeric"
                    year="numeric"
                    hour12=true
                    hour="2-digit"
                    minute="2-digit"
                  }}
                {{else if this.startsAndEndsOnSameDay}}
                  {{formatDate
                    @event.startDate
                    month="long"
                    weekday="long"
                    day="numeric"
                    year="numeric"
                    hour12=true
                    hour="2-digit"
                    minute="2-digit"
                  }}
                  -
                  {{formatDate @event.endDate hour12=true hour="2-digit" minute="2-digit"}}
                {{else}}
                  {{formatDate
                    @event.startDate
                    month="long"
                    weekday="long"
                    day="numeric"
                    year="numeric"
                    hour12=true
                    hour="2-digit"
                    minute="2-digit"
                  }}
                  -
                  {{formatDate
                    @event.endDate
                    month="long"
                    weekday="long"
                    day="numeric"
                    year="numeric"
                    hour12=true
                    hour="2-digit"
                    minute="2-digit"
                  }}
                {{/if}}
              </span>
            {{/unless}}
            <span class="single-event-location">
              <OfferingUrlDisplay @url={{@event.url}} />
              {{@event.location}}
            </span>
          </div>
          {{#if this.taughtBy}}
            <div class="single-event-instructors">
              {{this.taughtBy}}
            </div>
          {{/if}}
          <div class="single-event-session-is">
            {{t "general.sessionType"}}:
            {{@event.sessionTypeTitle}}
          </div>
          {{#if @event.equipmentRequired}}
            <div class="single-event-equipment-required">
              <FaIcon @icon={{faFlask}} @title={{t "general.specialEquipment"}} />
              {{t "general.specialEquipmentIsRequired"}}
            </div>
          {{/if}}
          {{#if @event.attireRequired}}
            <div class="single-event-attire-required">
              <FaIcon @icon={{faBlackTie}} @title={{t "general.whitecoatsSlashSpecialAttire"}} />
              {{t "general.specialAttireIsRequired"}}
            </div>
          {{/if}}
          {{#if @event.attendanceRequired}}
            <div class="single-event-attendance-required">
              <FaIcon @icon={{faCalendarCheck}} @title={{t "general.attendanceIsRequired"}} />
              {{t "general.attendanceIsRequired"}}
            </div>
          {{/if}}
          {{#if @event.supplemental}}
            <div class="single-event-supplemental">
              <FaIcon @icon={{faCalendarMinus}} @title={{t "general.supplementalCurriculum"}} />
              {{t "general.supplementalCurriculum"}}
            </div>
          {{/if}}
          {{#if @event.sessionDescription}}
            <div class="single-event-session-description">
              {{this.sessionDescription}}
            </div>
          {{/if}}
        </div>
        <div class="single-event-learningmaterial-list" data-test-session-materials>
          <h3>
            <button
              class="expand-collapse-toggle-btn"
              aria-expanded={{if this.isSessionMaterialsListExpanded "true" "false"}}
              aria-label={{if
                this.isSessionMaterialsListExpanded
                (t "general.hideSessionMaterials")
                (t "general.showSessionMaterials")
              }}
              type="button"
              {{on
                "click"
                (set
                  this "isSessionMaterialsListExpanded" (not this.isSessionMaterialsListExpanded)
                )
              }}
              data-test-expand-collapse
            >
              {{t "general.materials"}}
              ({{add this.sessionLearningMaterials.length this.preworkMaterials.length}})
              <FaIcon @icon={{if this.isSessionMaterialsListExpanded faCaretDown faCaretRight}} />
            </button>
            {{#if (and @event.isUserEvent this.userIsStudent)}}
              <button
                class="link-button"
                type="button"
                data-test-link-to-all-materials
                title={{t "general.accessAllMaterialsForThisCourse"}}
                {{on "click" this.transitionToMyMaterials}}
              >
                <FaIcon @icon={{faBoxArchive}} />
              </button>
            {{/if}}
          </h3>
          {{#if this.isSessionMaterialsListExpanded}}
            <SingleEventLearningmaterialList
              @learningMaterials={{this.sessionLearningMaterials}}
              @prework={{this.preworkMaterials}}
            />
          {{/if}}
        </div>
        <div class="single-event-objective-list" data-test-session-objectives>
          <SingleEventObjectiveList
            @groupByCompetenciesPhrase={{t "general.groupByCompetencies"}}
            @listByPriorityPhrase={{t "general.listByPriority"}}
            @objectives={{this.sessionObjectives}}
            @title={{t "general.objectives"}}
            @ariaLabelShow={{t "general.showObjectives"}}
            @ariaLabelHide={{t "general.hideObjectives"}}
            @isExpandedByDefault={{true}}
          />
        </div>
        <div data-test-course-materials>
          <h3>
            <button
              class="expand-collapse-toggle-btn"
              aria-expanded={{if this.isCourseMaterialsListExpanded "true" "false"}}
              aria-label={{if
                this.isCourseMaterialsListExpanded
                (t "general.hideCourseMaterials")
                (t "general.showCourseMaterials")
              }}
              type="button"
              {{on
                "click"
                (set this "isCourseMaterialsListExpanded" (not this.isCourseMaterialsListExpanded))
              }}
              data-test-expand-collapse
            >
              {{t "general.courseMaterials"}}
              ({{this.courseLearningMaterials.length}})
              <FaIcon @icon={{if this.isCourseMaterialsListExpanded faCaretDown faCaretRight}} />
            </button>
          </h3>
          {{#if this.isCourseMaterialsListExpanded}}
            <SingleEventLearningmaterialList @learningMaterials={{this.courseLearningMaterials}} />
          {{/if}}
        </div>
        <div class="single-event-objective-list" data-test-course-objectives>
          <SingleEventObjectiveList
            @groupByCompetenciesPhrase={{t "general.groupByCompetencies"}}
            @listByPriorityPhrase={{t "general.listByPriority"}}
            @objectives={{this.courseObjectives}}
            @title={{t "general.courseObjectives"}}
            @ariaLabelShow={{t "general.showCourseObjectives"}}
            @ariaLabelHide={{t "general.hideCourseObjectives"}}
            @isExpandedByDefault={{false}}
          />
        </div>
      {{else}}
        <NotFound />
      {{/if}}
    </div>
  </template>
}
