import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import moment from 'moment';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import striptags from 'striptags';

import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import ResolveFlatMapBy from 'ilios-common/classes/resolve-flat-map-by';
import AsyncProcess from 'ilios-common/classes/async-process';

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

  get learnerGroupCount() {
    return this.offeringLearnerGroups?.length ?? 0;
  }

  @use _course = new ResolveAsyncValue(() => [this.course]);
  get assignableVocabularies() {
    return this._course?.assignableVocabularies;
  }

  get xObjectives() {
    return this.sessionObjectives;
  }

  @use _ilmSession = new ResolveAsyncValue(() => [this.ilmSession]);
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

    if (!this._offerings?.length) {
      return null;
    }

    return this.sortedOfferingsByDate[0]?.startDate;
  }

  /**
   * The maximum duration in hours (incl. fractions) of any session offerings.
   */
  get maxSingleOfferingDuration() {
    if (!this._offerings?.length) {
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

  @use _allTermVocabularies = new ResolveFlatMapBy(() => [this.terms, 'vocabulary']);
  /**
   * A list of all vocabularies that are associated via terms.
   */
  get associatedVocabularies() {
    return this._allTermVocabularies?.uniq().sortBy('title');
  }

  get termCount() {
    return this.terms.length;
  }

  get associatedOfferingLearnerGroups() {
    return this.offeringLearnerGroups;
  }
  @use _ilmLearnerGroups = new ResolveAsyncValue(() => [this._ilmSession?.learnerGroups]);
  get associatedIlmLearnerGroups() {
    return this._ilmLearnerGroups?.toArray() ?? [];
  }

  get associatedLearnerGroups() {
    const ilmLearnerGroups = this.isIndependentLearning ? this.associatedIlmLearnerGroups : [];
    if (!this.offeringLearnerGroups || !ilmLearnerGroups) {
      return [];
    }
    return [...this.offeringLearnerGroups, ...ilmLearnerGroups.toArray()].uniq().sortBy('title');
  }

  @use _sessionObjectives = new ResolveAsyncValue(() => [this.sessionObjectives]);
  get sortedSessionObjectives() {
    return this._sessionObjectives?.toArray().sort(sortableByPosition);
  }

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

  get _ilmSessionInstructorsIfIlmSession() {
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
      !this._ilmSessionInstructorsIfIlmSession
    ) {
      return [];
    }

    return [
      ...this._offeringInstructors,
      ...this._offeringInstructorGroupInstructors,
      ...this._ilmSessionInstructorsIfIlmSession,
    ].uniq();
  }

  get hasPrerequisites() {
    return this.prerequisites.length > 0;
  }

  @use _postrequisite = new ResolveAsyncValue(() => [this.postrequisite]);

  get hasPostrequisite() {
    return !!this._postrequisite;
  }

  @use _sessionObjectiveCourseObjectives = new ResolveFlatMapBy(() => [
    this._sessionObjectives,
    'courseObjectives',
  ]);
  @use showUnlinkIcon = new AsyncProcess(() => [
    this.getShowUnlinkIcon.bind(this),
    this._sessionObjectiveCourseObjectives,
  ]);
  async getShowUnlinkIcon() {
    const sessionObjectives = await this.sessionObjectives;
    const collectionOfCourseObjectives = await Promise.all(
      sessionObjectives.mapBy('courseObjectives')
    );
    return collectionOfCourseObjectives.any((courseObjectives) => courseObjectives.length === 0);
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
}
