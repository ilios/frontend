import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class User extends Model {
  @attr('string')
  lastName;

  @attr('string')
  firstName;

  @attr('string')
  middleName;

  @attr('string')
  displayName;

  @attr('string')
  pronouns;

  @attr('string')
  phone;

  @attr('string')
  email;

  @attr('string')
  preferredEmail;

  @attr('boolean')
  addedViaIlios;

  @attr('boolean')
  enabled;

  @attr('string')
  campusId;

  @attr('string')
  otherId;

  @attr('boolean')
  examined;

  @attr('boolean')
  userSyncIgnore;

  @attr('string')
  icsFeedKey;

  @attr('boolean')
  root;

  @hasMany('report', { async: true, inverse: 'user' })
  reports;

  @belongsTo('school', { async: true, inverse: null })
  school;

  @belongsTo('authentication', { async: true, inverse: 'user' })
  authentication;

  @hasMany('course', {
    async: true,
    inverse: 'directors',
  })
  directedCourses;

  @hasMany('course', {
    async: true,
    inverse: 'administrators',
  })
  administeredCourses;

  @hasMany('course', {
    async: true,
    inverse: 'studentAdvisors',
  })
  studentAdvisedCourses;

  @hasMany('session', {
    async: true,
    inverse: 'studentAdvisors',
  })
  studentAdvisedSessions;

  @hasMany('learner-group', {
    async: true,
    inverse: 'users',
  })
  learnerGroups;

  @hasMany('learner-group', {
    async: true,
    inverse: 'instructors',
  })
  instructedLearnerGroups;

  @hasMany('instructor-group', {
    async: true,
    inverse: 'users',
  })
  instructorGroups;

  @hasMany('ilm-session', {
    async: true,
    inverse: 'instructors',
  })
  instructorIlmSessions;

  @hasMany('ilm-session', {
    async: true,
    inverse: 'learners',
  })
  learnerIlmSessions;

  @hasMany('offering', {
    async: true,
    inverse: 'learners',
  })
  offerings;

  @hasMany('offering', {
    async: true,
    inverse: 'instructors',
  })
  instructedOfferings;

  @hasMany('program-year', { async: true, inverse: 'directors' })
  programYears;

  @hasMany('user-role', { async: true, inverse: null })
  roles;

  @hasMany('school', {
    async: true,
    inverse: 'directors',
  })
  directedSchools;

  @hasMany('school', {
    async: true,
    inverse: 'administrators',
  })
  administeredSchools;

  @hasMany('session', {
    async: true,
    inverse: 'administrators',
  })
  administeredSessions;

  @hasMany('program', {
    async: true,
    inverse: 'directors',
  })
  directedPrograms;

  @hasMany('cohort', {
    async: true,
    inverse: 'users',
  })
  cohorts;

  @belongsTo('cohort', { async: true, inverse: null })
  primaryCohort;

  @hasMany('pending-user-update', { async: true, inverse: 'user' })
  pendingUserUpdates;

  @hasMany('curriculum-inventory-report', {
    async: true,
    inverse: 'administrators',
  })
  administeredCurriculumInventoryReports;

  @hasMany('user-session-material-status', { async: true, inverse: 'user' })
  sessionMaterialStatuses;

  @cached
  get _rolesData() {
    return new TrackedAsyncData(this.roles);
  }

  @cached
  get _cohortsData() {
    return new TrackedAsyncData(this.cohorts);
  }

  @cached
  get _offeringsData() {
    return new TrackedAsyncData(this.offerings);
  }

  @cached
  get _learnerIlmSessionsData() {
    return new TrackedAsyncData(this.learnerIlmSessions);
  }

  @cached
  get _directedCoursesData() {
    return new TrackedAsyncData(this.directedCourses);
  }

  @cached
  get _administeredCoursesData() {
    return new TrackedAsyncData(this.administeredCourses);
  }

  @cached
  get _administeredSessionsData() {
    return new TrackedAsyncData(this.administeredSessions);
  }

  @cached
  get _instructorGroupsData() {
    return new TrackedAsyncData(this.instructorGroups);
  }

  @cached
  get _instructedOfferingsData() {
    return new TrackedAsyncData(this.instructedOfferings);
  }

  @cached
  get _instructedLearnerGroupsData() {
    return new TrackedAsyncData(this.instructedLearnerGroups);
  }

  @cached
  get _directedProgramsData() {
    return new TrackedAsyncData(this.directedPrograms);
  }

  @cached
  get _programYearsData() {
    return new TrackedAsyncData(this.programYears);
  }

  @cached
  get _administeredCurriculumInventoryReportsData() {
    return new TrackedAsyncData(this.administeredCurriculumInventoryReports);
  }

  @cached
  get _directedSchoolsData() {
    return new TrackedAsyncData(this.directedSchools);
  }

  @cached
  get _administeredSchoolsData() {
    return new TrackedAsyncData(this.administeredSchools);
  }

  @cached
  get _instructorIlmSessionsData() {
    return new TrackedAsyncData(this.instructorIlmSessions);
  }

  @cached
  get _primaryCohortData() {
    return new TrackedAsyncData(this.primaryCohort);
  }

  get _roleTitles() {
    if (!this._rolesData.isResolved) {
      return [];
    }

    return this._rolesData.value.map((r) => r.title);
  }

  @cached
  get _learnerGroupsData() {
    return new TrackedAsyncData(this.learnerGroups);
  }

  get isStudent() {
    return Boolean(this._roleTitles.includes('Student'));
  }

  /**
   * Checks if a user is linked to any student things
   */
  get isLearner() {
    if (this._cohortsData.isResolved && this._cohortsData.value.length) {
      return true;
    }
    if (this._offeringsData.isResolved && this._offeringsData.value.length) {
      return true;
    }
    if (
      this._learnerIlmSessionSessionsData?.isResolved &&
      this._learnerIlmSessionSessionsData.value.length
    ) {
      return true;
    }

    return false;
  }

  /**
   * Checks if a user is linked to any non-student things
   */
  get performsNonLearnerFunction() {
    if (this._directedCoursesData.isResolved && this._directedCoursesData.value.length) {
      return true;
    }
    if (this._administeredCoursesData.isResolved && this._administeredCoursesData.value.length) {
      return true;
    }
    if (this._administeredSessionsData.isResolved && this._administeredSessionsData.value.length) {
      return true;
    }
    if (this._instructorGroupsData.isResolved && this._instructorGroupsData.value.length) {
      return true;
    }
    if (this._instructedOfferingsData.isResolved && this._instructedOfferingsData.value.length) {
      return true;
    }
    if (
      this._instructorIlmSessionsData.isResolved &&
      this._instructorIlmSessionsData.value.length
    ) {
      return true;
    }
    if (
      this._instructedLearnerGroupsData.isResolved &&
      this._instructedLearnerGroupsData.value.length
    ) {
      return true;
    }
    if (this._directedProgramsData.isResolved && this._directedProgramsData.value.length) {
      return true;
    }
    if (this._programYearsData.isResolved && this._programYearsData.value.length) {
      return true;
    }
    if (
      this._administeredCurriculumInventoryReportsData.isResolved &&
      this._administeredCurriculumInventoryReportsData.value.length
    ) {
      return true;
    }
    if (this._directedSchoolsData.isResolved && this._directedSchoolsData.value.length) {
      return true;
    }
    if (this._administeredSchoolsData.isResolved && this._administeredSchoolsData.value.length) {
      return true;
    }

    return false;
  }

  get fullName() {
    return this.displayName ?? this.fullNameFromFirstMiddleInitialLastName;
  }

  get fullNameFromFirstMiddleInitialLastName() {
    if (!this.firstName || !this.lastName) {
      return '';
    }

    const middleInitial = this.middleName ? this.middleName.charAt(0) : false;

    if (middleInitial) {
      return `${this.firstName} ${middleInitial}. ${this.lastName}`;
    } else {
      return `${this.firstName} ${this.lastName}`;
    }
  }

  get fullNameFromFirstMiddleLastName() {
    if (!this.firstName || !this.lastName) {
      return '';
    }

    if (this.middleName) {
      return `${this.firstName} ${this.middleName} ${this.lastName}`;
    } else {
      return `${this.firstName} ${this.lastName}`;
    }
  }

  get fullNameFromFirstLastName() {
    if (!this.firstName || !this.lastName) {
      return '';
    }
    return `${this.firstName} ${this.lastName}`;
  }

  get hasDifferentDisplayName() {
    const displayName = this.displayName?.trim().toLowerCase();
    // no display name? nothing to compare then.
    if (!displayName) {
      return false;
    }
    // compare the display name to 'first last', then to 'first middle last' and 'first m. last' as a fallbacks.
    return !(
      displayName === this.fullNameFromFirstLastName.trim().toLowerCase() ||
      displayName === this.fullNameFromFirstMiddleLastName.trim().toLowerCase() ||
      displayName === this.fullNameFromFirstMiddleInitialLastName.trim().toLowerCase()
    );
  }

  @cached
  get _instructedLearnerGroupOfferingsData() {
    if (!this._instructedLearnerGroupsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(
      Promise.all(this._instructedLearnerGroupsData.value.map((t) => t.offerings))
    );
  }

  get _allInstructedOfferings() {
    if (
      !this._instructedLearnerGroupOfferingsData?.isResolved ||
      !this._instructorGroupOfferings?.isResolved ||
      !this._instructedOfferingsData.isResolved
    ) {
      return [];
    }
    return uniqueValues([
      ...this._instructedLearnerGroupOfferingsData.value.flat(),
      ...this._instructorGroupOfferings.value.flat(),
      ...this._instructedOfferingsData.value,
    ]);
  }

  @cached
  get _allInstructedOfferingSessions() {
    return new TrackedAsyncData(Promise.all(this._allInstructedOfferings.map((o) => o.session)));
  }

  @cached
  get _instructorIlmSessionSessions() {
    if (!this._instructorIlmSessionsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(
      Promise.all(this._instructorIlmSessionsData.value.map((t) => t.session))
    );
  }

  @cached
  get _instructorGroupIlmSessions() {
    if (!this._instructorGroupsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(
      Promise.all(this._instructorGroupsData.value.map((i) => i.ilmSessions))
    );
  }

  @cached
  get _instructorGroupIlmSessionSessions() {
    if (!this._instructorGroupIlmSessions?.isResolved) {
      return null;
    }

    return new TrackedAsyncData(
      Promise.all(this._instructorGroupIlmSessions.value.flat().map((ilm) => ilm.session))
    );
  }

  @cached
  get _instructorGroupOfferings() {
    if (!this._instructorGroupsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(
      Promise.all(this._instructorGroupsData.value.map((g) => g.offerings))
    );
  }

  get allInstructedSessions() {
    if (
      !this._instructorIlmSessionSessions?.isResolved ||
      !this._instructorGroupIlmSessionSessions?.isResolved ||
      !this._allInstructedOfferingSessions.isResolved
    ) {
      return [];
    }
    return uniqueValues(
      [
        ...this._instructorIlmSessionSessions.value,
        ...this._instructorGroupIlmSessionSessions.value,
        ...this._allInstructedOfferingSessions.value,
      ].filter(Boolean)
    );
  }

  @cached
  get _allInstructedCoursesData() {
    if (
      !this._instructorIlmSessionSessions?.isResolved ||
      !this._instructorGroupIlmSessionSessions?.isResolved ||
      !this._allInstructedOfferingSessions.isResolved
    ) {
      return null;
    }
    return new TrackedAsyncData(
      Promise.all(
        uniqueValues(
          [
            ...this._instructorIlmSessionSessions.value,
            ...this._instructorGroupIlmSessionSessions.value,
            ...this._allInstructedOfferingSessions.value,
          ]
            .filter(Boolean)
            .map((s) => s.course)
        )
      )
    );
  }

  get allInstructedCourses() {
    if (!this._allInstructedCoursesData?.isResolved) {
      return [];
    }

    return this._allInstructedCoursesData.value;
  }

  @cached
  get _learnerIlmSessionSessionsData() {
    if (!this._learnerIlmSessionsData.isResolved) {
      return [];
    }
    return new TrackedAsyncData(
      Promise.all(this._learnerIlmSessionsData.value.map((i) => i.session))
    );
  }

  @cached
  get _learnerGroupOfferingsData() {
    if (!this._learnerGroupsData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(Promise.all(this._learnerGroupsData.value.map((l) => l.offerings)));
  }

  @cached
  get _learnerGroupIlmSessionsData() {
    if (!this._learnerGroupsData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(
      Promise.all(this._learnerGroupsData.value.map((l) => l.ilmSessions))
    );
  }

  @cached
  get _learnerSessionsData() {
    if (
      !this._offeringsData.isResolved ||
      !this._learnerIlmSessionsData.isResolved ||
      !this._learnerGroupOfferingsData?.isResolved ||
      !this._learnerGroupIlmSessionsData.isResolved
    ) {
      return null;
    }
    const offerings = this._offeringsData.value;
    const learnerIlmSessions = this._learnerIlmSessionsData.value;
    const learnerGroupOfferings = this._learnerGroupOfferingsData.value.flat();
    const ilmSessions = this._learnerGroupIlmSessionsData.value.flat();

    return new TrackedAsyncData(
      Promise.all(
        [...offerings, ...learnerIlmSessions, ...learnerGroupOfferings, ...ilmSessions].map(
          (obj) => obj.session
        )
      )
    );
  }

  @cached
  get _learnerCoursesData() {
    if (!this._learnerSessionsData?.isResolved) {
      return null;
    }

    return new TrackedAsyncData(Promise.all(this._learnerSessionsData.value.map((s) => s.course)));
  }

  get allRelatedCourses() {
    if (
      !this._learnerCoursesData?.isResolved ||
      !this._allInstructedCoursesData?.isResolved ||
      !this._directedCoursesData.isResolved ||
      !this._administeredCoursesData.isResolved
    ) {
      return [];
    }

    return uniqueValues([
      ...this._learnerCoursesData.value,
      ...this._allInstructedCoursesData.value,
      ...this._directedCoursesData.value,
      ...this._administeredCoursesData.value,
    ]);
  }

  get secondaryCohorts() {
    if (!this._cohortsData.isResolved || !this._primaryCohortData.isResolved) {
      return [];
    }
    return this._cohortsData.value.filter((cohort) => cohort !== this._primaryCohortData.value);
  }

  /**
   * Compare a user's learner groups to a list of learner groups and find the one
   * that is the lowest leaf in the learner group tree.
   * @property getLowestMemberGroupInALearnerGroupTree
   * @param {Array} learnerGroupTree all the groups we want to look into
   * @return {Object|null} The learner-group model or NULL if none could be found.
   * @type function
   * @public
   */
  async getLowestMemberGroupInALearnerGroupTree(learnerGroupTree) {
    const learnerGroups = await this.learnerGroups;
    //all the groups a user is in that are in our current learner groups tree
    const relevantGroups = learnerGroups
      .slice()
      .filter((group) => learnerGroupTree.includes(group));
    const relevantGroupIds = mapBy(relevantGroups, 'id');
    const lowestGroup = relevantGroups.find((group) => {
      const childIds = group.hasMany('children').ids();
      const childGroupsWhoAreUserGroupMembers = childIds.filter((id) =>
        relevantGroupIds.includes(id)
      );
      return childGroupsWhoAreUserGroupMembers.length === 0;
    });
    return lowestGroup ? lowestGroup : null;
  }
}
