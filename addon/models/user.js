import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import ResolveFlatMapBy from 'ilios-common/classes/resolve-flat-map-by';
import { mapBy } from '../utils/array-helpers';

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

  @hasMany('report', { async: true })
  reports;

  @belongsTo('school', { async: true })
  school;

  @belongsTo('authentication', { async: true })
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

  @hasMany('program-year', { async: true })
  programYears;

  @hasMany('user-role', { async: true })
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

  @hasMany('pending-user-update', { async: true })
  pendingUserUpdates;

  @hasMany('curriculum-inventory-report', {
    async: true,
    inverse: 'administrators',
  })
  administeredCurriculumInventoryReports;

  @hasMany('user-session-material-status', { async: true })
  sessionMaterialStatuses;

  @use _roles = new ResolveAsyncValue(() => [this.roles, []]);

  get _roleTitles() {
    return mapBy(this._roles, 'title');
  }

  get isStudent() {
    return Boolean(this._roleTitles?.includes('Student'));
  }

  @use _cohorts = new ResolveAsyncValue(() => [this.cohorts]);
  @use _offerings = new ResolveAsyncValue(() => [this.offerings]);
  @use _learnerIlmSessions = new ResolveAsyncValue(() => [this.learnerIlmSessions]);

  /**
   * Checks if a user is linked to any student things
   */
  get isLearner() {
    return Boolean(
      this._cohorts?.length || this._offerings?.length || this._learnerIlmSessions?.length
    );
  }

  @use _directedCourses = new ResolveAsyncValue(() => [this.directedCourses]);
  @use _administeredCourses = new ResolveAsyncValue(() => [this.administeredCourses]);
  @use _administeredSessions = new ResolveAsyncValue(() => [this.administeredSessions]);
  @use _instructorGroups = new ResolveAsyncValue(() => [this.instructorGroups]);
  @use _instructedOfferings = new ResolveAsyncValue(() => [this.instructedOfferings]);
  @use _instructedLearnerGroups = new ResolveAsyncValue(() => [this.instructedLearnerGroups]);
  @use _directedPrograms = new ResolveAsyncValue(() => [this.directedPrograms]);
  @use _programYears = new ResolveAsyncValue(() => [this.programYears]);
  @use _administeredCurriculumInventoryReports = new ResolveAsyncValue(() => [
    this.administeredCurriculumInventoryReports,
  ]);
  @use _directedSchools = new ResolveAsyncValue(() => [this.directedSchools]);
  @use _administeredSchools = new ResolveAsyncValue(() => [this.administeredSchools]);

  /**
   * Checks if a user is linked to any non-student things
   */
  get performsNonLearnerFunction() {
    return Boolean(
      this._directedCourses?.length ||
        this._administeredCourses?.length ||
        this._administeredSessions?.length ||
        this._instructorGroups?.length ||
        this._instructedOfferings?.length ||
        this._instructedIlmSessions?.length ||
        this._instructedLearnerGroups?.length ||
        this._directedPrograms?.length ||
        this._programYears?.length ||
        this._administeredCurriculumInventoryReports?.length ||
        this._directedSchools?.length ||
        this._administeredSchools?.length
    );
  }

  get fullName() {
    return this.displayName ? this.displayName : this.fullNameFromFirstMiddleInitialLastName;
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

  @use _instructedLearnerGroupOfferings = new ResolveFlatMapBy(() => [
    this._instructedLearnerGroups,
    'offerings',
  ]);

  get _instructedOfferings() {
    if (!this._instructedLearnerGroupOfferings || !this._instructedOfferings) {
      return [];
    }
    return [...this._instructedLearnerGroupOfferings, ...this._instructedOfferings].uniq();
  }

  @use _instructorIlmSessions = new ResolveAsyncValue(() => [this.instructorIlmSessions]);
  @use _instructorIlmSessionsSessions = new ResolveFlatMapBy(() => [
    this._instructorIlmSessions,
    'session',
  ]);

  get _instructedIlmSessions() {
    if (!this._instructorIlmSessions) {
      return [];
    }
    return this._instructorIlmSessions.toArray();
  }

  @use _instructedOfferingSessions = new ResolveFlatMapBy(() => [
    this._instructedOfferings,
    'session',
  ]);
  @use _instructorGroupSessions = new ResolveFlatMapBy(() => [this._instructorGroups, 'sessions']);

  get allInstructedSessions() {
    if (
      !this._instructorIlmSessionsSessions ||
      !this._instructedOfferingSessions ||
      !this._instructorGroupSessions
    ) {
      return [];
    }
    return [
      ...this._instructorIlmSessionsSessions,
      ...this._instructedOfferingSessions,
      ...this._instructorGroupSessions,
    ]
      .uniq()
      .filter(Boolean);
  }

  @use allInstructedCourses = new ResolveFlatMapBy(() => [this.allInstructedSessions, 'course']);

  @use _offeringSessions = new ResolveFlatMapBy(() => [this._offerings, 'session']);
  @use _learnerIlmSessionSessions = new ResolveFlatMapBy(() => [
    this._learnerIlmSessions,
    'session',
  ]);
  @use _learnerGroupOfferings = new ResolveFlatMapBy(() => [this.learnerGroups, 'offerings']);
  @use _learnerGroupIlmSessions = new ResolveFlatMapBy(() => [this.learnerGroups, 'ilmSessions']);
  @use _learnerGroupIlmSessionsSessions = new ResolveFlatMapBy(() => [
    this._learnerGroupIlmSessions,
    'session',
  ]);

  get _learnerOfferings() {
    if (!this._learnerGroupOfferings || !this._offerings) {
      return [];
    }
    return [...this._learnerGroupOfferings, ...this._offerings.toArray()].uniq();
  }
  @use _learnerOfferingSessions = new ResolveFlatMapBy(() => [this._learnerOfferings, 'session']);

  get _learnerSessions() {
    if (
      !this._learnerOfferingSessions ||
      !this._learnerIlmSessionSessions ||
      !this._learnerGroupIlmSessionsSessions
    ) {
      return [];
    }
    return [
      ...this._learnerOfferingSessions,
      ...this._learnerIlmSessionSessions,
      ...this._learnerGroupIlmSessionsSessions,
    ]
      .uniq()
      .filter(Boolean);
  }

  @use _learnerCourses = new ResolveFlatMapBy(() => [this._learnerSessions, 'course']);

  get allRelatedCourses() {
    if (
      !this._learnerCourses ||
      !this.allInstructedCourses ||
      !this._directedCourses ||
      !this._administeredCourses
    ) {
      return [];
    }
    return [
      ...this._learnerCourses,
      ...this.allInstructedCourses,
      ...this._directedCourses.toArray(),
      ...this._administeredCourses.toArray(),
    ].uniq();
  }

  @use _primaryCohort = new ResolveAsyncValue(() => [this.primaryCohort]);

  get secondaryCohorts() {
    if (!this._cohorts || !this._primaryCohort) {
      return [];
    }
    return this._cohorts.toArray().filter((cohort) => cohort !== this._primaryCohort);
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
      .toArray()
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
