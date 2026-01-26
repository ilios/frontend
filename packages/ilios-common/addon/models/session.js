import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { DateTime } from 'luxon';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import striptags from 'striptags';
import { filter } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { mapBy, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';

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

  @belongsTo('session-type', { async: true, inverse: 'sessions' })
  sessionType;

  @belongsTo('course', { async: true, inverse: 'sessions' })
  course;

  @cached
  get _courseData() {
    return new TrackedAsyncData(this.course);
  }

  @belongsTo('ilm-session', { async: true, inverse: 'session' })
  ilmSession;

  @cached
  get _ilmSessionData() {
    return new TrackedAsyncData(this.ilmSession);
  }

  get _ilmSession() {
    if (!this._ilmSessionData.isResolved) {
      return null;
    }

    return this._ilmSessionData.value;
  }

  @hasMany('session-objective', { async: true, inverse: 'session' })
  sessionObjectives;

  @cached
  get _sessionObjectivesData() {
    return new TrackedAsyncData(this.sessionObjectives);
  }

  @hasMany('mesh-descriptor', { async: true, inverse: 'sessions' })
  meshDescriptors;

  @hasMany('session-learning-material', { async: true, inverse: 'session' })
  learningMaterials;

  @hasMany('offering', { async: true, inverse: 'session' })
  offerings;

  @cached
  get _offeringsData() {
    return new TrackedAsyncData(this.offerings);
  }

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

  @cached
  get _postrequisiteData() {
    return new TrackedAsyncData(this.postrequisite);
  }

  @hasMany('session', {
    inverse: 'postrequisite',
    async: true,
  })
  prerequisites;

  @hasMany('term', { async: true, inverse: 'sessions' })
  terms;

  @cached
  get _termsData() {
    return new TrackedAsyncData(this.terms);
  }

  @cached
  get _ilmLearnerGroupsData() {
    if (!this._ilmSessionData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(this._ilmSessionData.value?.learnerGroups);
  }

  @cached
  get _ilmInstructorsData() {
    if (!this._ilmSessionData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(this._ilmSessionData.value.instructors);
  }

  @cached
  get _ilmSessionInstructorGroupsData() {
    if (!this._ilmSessionData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(this._ilmSessionData.value.instructorGroups);
  }

  @cached
  get _ilmSessionInstructorGroupsInstructorsData() {
    if (!this._ilmSessionInstructorGroupsData?.isResolved) {
      return null;
    }
    return new TrackedAsyncData(
      Promise.all(this._ilmSessionInstructorGroupsData.value.map((i) => i.users)),
    );
  }

  @cached
  get _offeringLearnerGroupsData() {
    if (!this._offeringsData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(Promise.all(this._offeringsData.value.map((o) => o.learnerGroups)));
  }

  @cached
  get _offeringInstructorsData() {
    if (!this._offeringsData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(Promise.all(this._offeringsData.value.map((o) => o.instructors)));
  }

  @cached
  get _offeringInstructorGroups() {
    if (!this._offeringsData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(
      Promise.all(this._offeringsData.value.map((o) => o.instructorGroups)),
    );
  }

  @cached
  get _offeringInstructorGroupsInstructors() {
    if (!this._offeringInstructorGroups?.isResolved) {
      return null;
    }
    return new TrackedAsyncData(
      Promise.all(this._offeringInstructorGroups.value.flat().map((o) => o.users)),
    );
  }

  @cached
  get _termVocabularies() {
    if (!this._termsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(Promise.all(this._termsData.value.map((t) => t.vocabulary)));
  }

  @cached
  get _sessionObjectiveCourseObjectives() {
    if (!this._sessionObjectivesData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(
      Promise.all(this._sessionObjectivesData.value.map((so) => so.courseObjectives)),
    );
  }

  get showUnlinkIcon() {
    if (!this._sessionObjectivesData.isResolved) {
      return false;
    }

    const unlinkedSessionObectives = this._sessionObjectivesData.value.find(
      (so) => so.hasMany('courseObjectives').ids().length === 0,
    );

    return Boolean(unlinkedSessionObectives);
  }

  get learnerGroupCount() {
    return this.associatedLearnerGroups.length;
  }

  get assignableVocabularies() {
    if (!this._courseData.isResolved) {
      return [];
    }
    return this._courseData.value.assignableVocabularies;
  }

  get xObjectives() {
    return this.sessionObjectives;
  }

  get isIndependentLearning() {
    if (this.belongsTo('ilmSession').id()) {
      return true;
    }

    if (this._ilmSessionData.isResolved) {
      return Boolean(this._ilmSessionData.value);
    }

    return false;
  }

  /**
   * All offerings for this session, sorted by offering start date in ascending order.
   */
  get sortedOfferingsByDate() {
    if (!this._offeringsData.isResolved) {
      return [];
    }
    const filteredOfferings = this._offeringsData.value.filter((offering) => offering.startDate);
    return filteredOfferings.sort((a, b) => {
      const aDate = DateTime.fromJSDate(a.startDate);
      const bDate = DateTime.fromJSDate(b.startDate);
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
    if (this.isIndependentLearning) {
      return this._ilmSessionData.isResolved ? this._ilmSessionData.value.dueDate : undefined;
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
    if (!this.hasMany('offerings').ids().length || !this._offeringsData.isResolved) {
      return 0;
    }
    const sortedOfferings = this._offeringsData.value.toSorted(function (a, b) {
      const diffA = DateTime.fromJSDate(a.endDate).diff(
        DateTime.fromJSDate(a.startDate),
        'minutes',
      ).minutes;
      const diffB = DateTime.fromJSDate(b.endDate).diff(
        DateTime.fromJSDate(b.startDate),
        'minutes',
      ).minutes;
      if (diffA > diffB) {
        return -1;
      } else if (diffA < diffB) {
        return 1;
      }
      return 0;
    });

    const offering = sortedOfferings[0];
    const duration = DateTime.fromJSDate(offering.endDate).diff(
      DateTime.fromJSDate(offering.startDate),
      'hours',
    );
    return duration.hours.toFixed(2);
  }

  /**
   * The total duration in hours (incl. fractions) of all session offerings.
   */
  get totalSumOfferingsDuration() {
    if (!this._offeringsData.isResolved || this._offeringsData.value.length === 0) {
      return 0;
    }

    return this._offeringsData.value
      .reduce((total, offering) => {
        return (
          total +
          DateTime.fromJSDate(offering.endDate).diff(
            DateTime.fromJSDate(offering.startDate),
            'hours',
          ).hours
        );
      }, 0)
      .toFixed(2);
  }

  /**
   * Total duration in hours for offerings and ILM Sessions
   * If both ILM and offerings are present sum them
   */
  get totalSumDuration() {
    if (!this.isIndependentLearning) {
      return this.totalSumOfferingsDuration;
    }

    if (!this._ilmSessionData.isResolved) {
      return 0;
    }

    return (
      parseFloat(this._ilmSessionData.value.hours) + parseFloat(this.totalSumOfferingsDuration)
    );
  }

  /**
   * The maximum duration in hours (incl. fractions) of any session offerings, plus any ILM hours.
   * If both ILM and offerings are present sum them
   */
  get maxDuration() {
    if (!this.isIndependentLearning) {
      return this.maxSingleOfferingDuration;
    }

    if (!this._ilmSessionData.isResolved) {
      return 0;
    }

    return (
      parseFloat(this._ilmSessionData.value.hours) + parseFloat(this.maxSingleOfferingDuration)
    );
  }

  /**
   * A list of all vocabularies that are associated via terms.
   */
  get associatedVocabularies() {
    if (!this._termVocabularies?.isResolved) {
      return [];
    }
    return sortBy(uniqueValues(this._termVocabularies.value), 'title');
  }

  get termCount() {
    return this.hasMany('terms').ids().length;
  }

  get offeringCount() {
    return this.hasMany('offerings').ids().length;
  }

  get objectiveCount() {
    return this.hasMany('sessionObjectives').ids().length;
  }

  get associatedOfferingLearnerGroups() {
    if (!this._offeringLearnerGroupsData?.isResolved) {
      return [];
    }
    return sortBy(uniqueValues(this._offeringLearnerGroupsData.value.flat()), 'title');
  }

  get associatedIlmLearnerGroups() {
    if (!this._ilmLearnerGroupsData?.isResolved) {
      return [];
    }

    return this._ilmLearnerGroupsData.value ?? [];
  }

  get associatedLearnerGroups() {
    if (!this._ilmLearnerGroupsData?.isResolved || !this._offeringLearnerGroupsData?.isResolved) {
      return [];
    }

    const ilmLearnerGroups = this.isIndependentLearning ? this._ilmLearnerGroupsData.value : [];
    return sortBy(
      uniqueValues([...this._offeringLearnerGroupsData.value.flat(), ...ilmLearnerGroups]),
      'title',
    );
  }

  get sortedSessionObjectives() {
    if (!this._sessionObjectivesData.isResolved) {
      return null;
    }
    return this._sessionObjectivesData.value.toSorted(sortableByPosition);
  }

  get ilmSessionInstructors() {
    if (!this.isIndependentLearning) {
      return [];
    }

    if (!this._ilmSessionInstructors || !this._ilmSessionInstructorGroupInstructors) {
      return [];
    }

    return [...this._ilmSessionInstructors, ...this._ilmSessionInstructorGroupInstructors];
  }

  get allInstructors() {
    if (
      !this._offeringInstructorsData?.isResolved ||
      !this._offeringInstructorGroupsInstructors?.isResolved ||
      (this.isIndependentLearning && !this._ilmInstructorsData?.isResolved) ||
      (this.isIndependentLearning && !this._ilmSessionInstructorGroupsInstructorsData?.isResolved)
    ) {
      return [];
    }

    const ilmInstructors = this.isIndependentLearning ? this._ilmInstructorsData.value : [];
    const ilmInstructorGroupInstructors = this.isIndependentLearning
      ? this._ilmSessionInstructorGroupsInstructorsData.value.flat()
      : [];

    return uniqueValues([
      ...this._offeringInstructorsData.value.flat(),
      ...this._offeringInstructorGroupsInstructors.value.flat(),
      ...ilmInstructors,
      ...ilmInstructorGroupInstructors,
    ]);
  }

  get hasPrerequisites() {
    return this.prerequisites.length > 0;
  }

  get prerequisiteCount() {
    return this.hasMany('prerequisites').ids().length;
  }

  get hasPostrequisite() {
    return !!this.belongsTo('postrequisite')?.id();
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

  @cached
  get sessionTitlesInCourse() {
    const rhett = new Map();
    if (!this._courseData.isResolved) {
      return rhett;
    }
    const course = this._courseData.value;
    if (!course._sessionsData.isResolved) {
      return rhett;
    }
    const sessions = course._sessionsData.value;
    sortBy(sessions, 'id').forEach((session) => {
      if (!rhett.has(session.title)) {
        rhett.set(session.title, new Set());
      }
      rhett.get(session.title).add(session.id);
    });
    return rhett;
  }

  get uniqueTitleInCourse() {
    if (!this.sessionTitlesInCourse.has(this.title)) {
      return this.title;
    }
    const sessionIds = [...this.sessionTitlesInCourse.get(this.title)];
    if (sessionIds.indexOf(this.id) <= 0) {
      return this.title;
    }
    return `${this.title}, ${sessionIds.indexOf(this.id) + 1}`;
  }

  async getAllIlmSessionInstructors() {
    const ilmSession = await this.ilmSession;
    if (!ilmSession) {
      return [];
    }
    return ilmSession.getAllInstructors();
  }

  async getAllOfferingInstructors() {
    const offerings = await this.offerings;
    if (!offerings.length) {
      return [];
    }
    const allOfferingInstructors = await Promise.all(
      offerings.map(async (offering) => {
        return await offering.getAllInstructors();
      }),
    );

    return uniqueValues(allOfferingInstructors.flat());
  }

  async getAllInstructors() {
    const allIlmSessionInstructors = await this.getAllIlmSessionInstructors();
    const allOfferingInstructors = await this.getAllOfferingInstructors();
    return uniqueValues([...allOfferingInstructors, ...allIlmSessionInstructors]);
  }

  async getTotalSumOfferingsDuration() {
    const offerings = await this.offerings;

    if (!offerings.length) {
      return 0;
    }

    return offerings
      .reduce((total, offering) => {
        return (
          total +
          DateTime.fromJSDate(offering.endDate).diff(
            DateTime.fromJSDate(offering.startDate),
            'hours',
          ).hours
        );
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
    const offeringsWithUser = await filter(offerings, async (offering) => {
      const instructors = await offering.getAllInstructors();
      return mapBy(instructors, 'id').includes(user.id);
    });
    const offeringHours = offeringsWithUser
      .reduce((total, offering) => {
        return (
          total +
          DateTime.fromJSDate(offering.endDate).diff(
            DateTime.fromJSDate(offering.startDate),
            'hours',
          ).hours
        );
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
