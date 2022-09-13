import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import moment from 'moment';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import striptags from 'striptags';
import { filter } from 'rsvp';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import ResolveFlatMapBy from 'ilios-common/classes/resolve-flat-map-by';
import AsyncProcess from 'ilios-common/classes/async-process';
import { mapBy, sortByString, uniqueById } from '../utils/array-helpers';

export default class SessionModel extends Model {
  @attr('string')
  title;

  @attr('string')
  description;

  @attr('boolean')
  attireRequired;

  @attr('boolean')
  equipmentRequired;

  @attr('boolean')
  supplemental;

  @attr('boolean')
  attendanceRequired;

  @attr('string')
  instructionalNotes;

  @attr('date')
  updatedAt;

  @attr('boolean')
  publishedAsTbd;

  @attr('boolean')
  published;

  @belongsTo('session-type', { async: true })
  sessionType;

  @belongsTo('course', { async: true })
  course;

  @belongsTo('ilm-session', { async: true })
  ilmSession;

  @hasMany('session-objective', { async: true })
  sessionObjectives;

  @hasMany('mesh-descriptor', { async: true })
  meshDescriptors;

  @hasMany('session-learning-material', { async: true })
  learningMaterials;

  @hasMany('offering', { async: true })
  offerings;

  @hasMany('user', {
    async: true,
    inverse: 'administeredSessions',
  })
  administrators;

  @hasMany('user', {
    async: true,
    inverse: 'studentAdvisedSessions',
  })
  studentAdvisors;

  @belongsTo('session', {
    inverse: 'prerequisites',
    async: true,
  })
  postrequisite;

  @hasMany('session', {
    inverse: 'postrequisite',
    async: true,
  })
  prerequisites;

  @hasMany('term', { async: true })
  terms;

  @use _offerings = new ResolveAsyncValue(() => [this.offerings]);
  @use offeringLearnerGroups = new ResolveFlatMapBy(() => [this.offerings, 'learnerGroups']);
  @use _course = new ResolveAsyncValue(() => [this.course]);
  @use _ilmSession = new ResolveAsyncValue(() => [this.ilmSession]);
  @use _allTermVocabularies = new ResolveFlatMapBy(() => [this.terms, 'vocabulary']);
  @use _ilmLearnerGroups = new ResolveAsyncValue(() => [this._ilmSession?.learnerGroups]);
  @use _sessionObjectives = new ResolveAsyncValue(() => [this.sessionObjectives]);
  @use _offeringInstructors = new ResolveFlatMapBy(() => [this._offerings, 'instructors']);
  @use _offeringInstructorGroups = new ResolveFlatMapBy(() => [
    this._offerings,
    'instructorGroups',
  ]);
  @use _offeringInstructorGroupInstructors = new ResolveFlatMapBy(() => [
    this._offeringInstructorGroups,
    'users',
  ]);
  @use _ilmSessionInstructors = new ResolveAsyncValue(() => [this._ilmSession?.instructors]);
  @use _ilmSessionInstructorGroups = new ResolveAsyncValue(() => [
    this._ilmSession?.instructorGroups,
  ]);
  @use _ilmSessionInstructorGroupInstructors = new ResolveFlatMapBy(() => [
    this._ilmSessionInstructorGroups,
    'users',
  ]);
  @use _postrequisite = new ResolveAsyncValue(() => [this.postrequisite]);
  @use _sessionObjectiveCourseObjectives = new ResolveFlatMapBy(() => [
    this._sessionObjectives,
    'courseObjectives',
  ]);
  @use showUnlinkIcon = new AsyncProcess(() => [
    this.getShowUnlinkIcon.bind(this),
    this._sessionObjectiveCourseObjectives,
  ]);

  get learnerGroupCount() {
    return this.offeringLearnerGroups?.length ?? 0;
  }

  get assignableVocabularies() {
    return this._course?.assignableVocabularies;
  }

  get xObjectives() {
    return this.sessionObjectives;
  }

  get isIndependentLearning() {
    return !!this._ilmSession;
  }

  /**
   * All offerings for this session, sorted by offering start date in ascending order.
   */
  get sortedOfferingsByDate() {
    if (!this._offerings) {
      return [];
    }
    const filteredOfferings = this._offerings.filter((offering) => offering.startDate);
    return filteredOfferings.sort((a, b) => {
      const aDate = moment(a.startDate);
      const bDate = moment(b.startDate);
      if (aDate === bDate) {
        return 0;
      }
      return aDate > bDate ? 1 : -1;
    });
  }

  /**
   * The earliest start date of all offerings in this session, or, if this is an ILM session, the ILM's due date.
   */
  get firstOfferingDate() {
    if (this._ilmSession) {
      return this._ilmSession.dueDate;
    }

    if (!this.hasMany('offerings').ids().length) {
      return null;
    }

    return this.sortedOfferingsByDate[0]?.startDate;
  }

  /**
   * The maximum duration in hours (incl. fractions) of any session offerings.
   */
  get maxSingleOfferingDuration() {
    if (!this.hasMany('offerings').ids().length || !this._offerings) {
      return 0;
    }
    const sortedOfferings = this._offerings.toArray().sort(function (a, b) {
      const diffA = moment(a.endDate).diff(moment(a.startDate), 'minutes');
      const diffB = moment(b.endDate).diff(moment(b.startDate), 'minutes');
      if (diffA > diffB) {
        return -1;
      } else if (diffA < diffB) {
        return 1;
      }
      return 0;
    });

    const offering = sortedOfferings[0];
    const duration = moment(offering.endDate).diff(moment(offering.startDate), 'hours', true);

    return duration.toFixed(2);
  }

  /**
   * The total duration in hours (incl. fractions) of all session offerings.
   */
  get totalSumOfferingsDuration() {
    if (!this._offerings?.length) {
      return 0;
    }

    return this._offerings
      .reduce((total, offering) => {
        return total + moment(offering.endDate).diff(moment(offering.startDate), 'hours', true);
      }, 0)
      .toFixed(2);
  }

  /**
   * Total duration in hours for offerings and ILM Sessions
   * If both ILM and offerings are present sum them
   */
  get totalSumDuration() {
    if (!this._ilmSession) {
      return this.totalSumOfferingsDuration;
    }

    const ilmHours = this._ilmSession.hours;

    return parseFloat(ilmHours) + parseFloat(this.totalSumOfferingsDuration);
  }

  /**
   * The maximum duration in hours (incl. fractions) of any session offerings, plus any ILM hours.
   * If both ILM and offerings are present sum them
   */
  get maxDuration() {
    if (!this._ilmSession) {
      return this.maxSingleOfferingDuration;
    }

    const ilmHours = this._ilmSession.hours;

    return parseFloat(ilmHours) + parseFloat(this.maxSingleOfferingDuration);
  }

  /**
   * A list of all vocabularies that are associated via terms.
   */
  get associatedVocabularies() {
    return sortByString(uniqueById(this._allTermVocabularies), 'title');
  }

  get termCount() {
    return this.hasMany('terms').ids().length;
  }

  get associatedOfferingLearnerGroups() {
    if (!this.offeringLearnerGroups) {
      return [];
    }
    return sortByString(uniqueById(this.offeringLearnerGroups), 'title');
  }
  get associatedIlmLearnerGroups() {
    return this._ilmLearnerGroups?.toArray() ?? [];
  }

  get associatedLearnerGroups() {
    const ilmLearnerGroups = this.isIndependentLearning ? this.associatedIlmLearnerGroups : [];
    if (!this.offeringLearnerGroups || !ilmLearnerGroups) {
      return [];
    }
    return sortByString(
      uniqueById([...this.offeringLearnerGroups, ...ilmLearnerGroups.toArray()]),
      'title'
    );
  }

  get sortedSessionObjectives() {
    return this._sessionObjectives?.toArray().sort(sortableByPosition);
  }

  get ilmSessionInstructors() {
    if (!this.isIndependentLearning) {
      return [];
    }

    if (!this._ilmSessionInstructors || !this._ilmSessionInstructorGroupInstructors) {
      return [];
    }

    return [
      ...this._ilmSessionInstructors.toArray(),
      ...this._ilmSessionInstructorGroupInstructors,
    ];
  }

  get allInstructors() {
    if (
      !this._offeringInstructors ||
      !this._offeringInstructorGroupInstructors ||
      !this.ilmSessionInstructors
    ) {
      return [];
    }

    return uniqueById([
      ...this._offeringInstructors,
      ...this._offeringInstructorGroupInstructors,
      ...this.ilmSessionInstructors,
    ]);
  }

  get hasPrerequisites() {
    return this.prerequisites.length > 0;
  }

  get hasPostrequisite() {
    return !!this._postrequisite;
  }

  get requiredPublicationIssues() {
    const issues = [];
    if (this.isIndependentLearning) {
      if (!this._ilmSession?.dueDate) {
        issues.push('dueDate');
      }
    } else {
      if (this.offerings.length === 0) {
        issues.push('offerings');
      }
    }
    if (!this.title) {
      issues.push('title');
    }

    return issues;
  }
  get optionalPublicationIssues() {
    const issues = [];
    if (this.terms.length === 0) {
      issues.push('terms');
    }

    if (this.sessionObjectives.length === 0) {
      issues.push('sessionObjectives');
    }

    if (this.meshDescriptors.length === 0) {
      issues.push('meshDescriptors');
    }

    return issues;
  }

  get isPublished() {
    return this.published;
  }

  get isNotPublished() {
    return !this.isPublished;
  }

  get isScheduled() {
    return this.publishedAsTbd;
  }

  get isPublishedOrScheduled() {
    return this.publishedAsTbd || this.isPublished;
  }

  get allPublicationIssuesLength() {
    return this.requiredPublicationIssues.length + this.optionalPublicationIssues.length;
  }

  get textDescription() {
    return striptags(this.description);
  }

  async getShowUnlinkIcon() {
    const sessionObjectives = await this.sessionObjectives;
    const collectionOfCourseObjectives = await Promise.all(
      mapBy(sessionObjectives, 'courseObjectives')
    );
    return collectionOfCourseObjectives.any((courseObjectives) => courseObjectives.length === 0);
  }

  async getAllIlmSessionInstructors() {
    const ilmSession = await this.ilmSession;
    if (!ilmSession) {
      return [];
    }
    return ilmSession.getAllInstructors();
  }

  async getAllOfferingInstructors() {
    const offerings = (await this.offerings).toArray();
    if (!offerings.length) {
      return [];
    }
    const allOfferingInstructors = await Promise.all(
      offerings.map(async (offering) => {
        return (await offering.getAllInstructors()).toArray();
      })
    );

    return uniqueById(allOfferingInstructors.flat());
  }

  async getAllInstructors() {
    const allIlmSessionInstructors = await this.getAllIlmSessionInstructors();
    const allOfferingInstructors = await this.getAllOfferingInstructors();
    return uniqueById([...allOfferingInstructors, ...allIlmSessionInstructors]);
  }

  async getTotalSumOfferingsDuration() {
    const offerings = await this.offerings;

    if (!offerings.length) {
      return 0;
    }

    return offerings
      .reduce((total, offering) => {
        return total + moment(offering.endDate).diff(moment(offering.startDate), 'hours', true);
      }, 0)
      .toFixed(2);
  }

  async getTotalSumDuration() {
    const ilmSession = await this.ilmSession;
    const totalSumOfferingDuration = await this.getTotalSumOfferingsDuration();
    if (!ilmSession) {
      return totalSumOfferingDuration;
    }
    return parseFloat(ilmSession.hours) + parseFloat(totalSumOfferingDuration);
  }

  async getTotalSumOfferingsDurationByInstructor(user) {
    const offerings = await this.offerings;
    const offeringsWithUser = await filter(offerings.toArray(), async (offering) => {
      const instructors = await offering.getAllInstructors();
      return mapBy(instructors, 'id').includes(user.id);
    });
    const offeringHours = offeringsWithUser
      .reduce((total, offering) => {
        return total + moment(offering.endDate).diff(moment(offering.startDate), 'hours', true);
      }, 0)
      .toFixed(2);
    return Math.round(offeringHours * 60);
  }

  async getTotalSumIlmDurationByInstructor(user) {
    const ilmSession = await this.ilmSession;
    let ilmMinutes = 0;
    if (ilmSession) {
      const instructors = await ilmSession.getAllInstructors();
      if (mapBy(instructors, 'id').includes(user.id)) {
        ilmMinutes = Math.round(parseFloat(ilmSession.hours) * 60);
      }
    }
    return ilmMinutes;
  }

  async getTotalSumDurationByInstructor(user) {
    const offeringMinutes = await this.getTotalSumOfferingsDurationByInstructor(user);
    const ilmMinutes = await this.getTotalSumIlmDurationByInstructor(user);
    return parseFloat(offeringMinutes) + parseFloat(ilmMinutes);
  }
}
