import CommonDataLoaderService from 'ilios-common/services/data-loader';

export default class DataLoaderService extends CommonDataLoaderService {
  #loadedLearnerGroupWithCourses = new Map();
  #loadedLearnerGroup = new Map();
  #loadedSchoolInstructorGroups = new Map();
  #loadedCohortLearnerGroups = new Map();
  #loadedUserProfiles = new Map();
  async loadCoursesForLearnerGroup(learnerGroupId) {
    if (!this.#loadedLearnerGroupWithCourses.has(learnerGroupId)) {
      const sessionIncludes = 'offerings.session.course';
      const ilmIncludes = 'ilmSessions.session.course';
      const includes = [];
      for (let i = 0; i < 5; i++) {
        const children = 'children.'.repeat(i);
        includes.push(`${children}${sessionIncludes}`);
        includes.push(`${children}${ilmIncludes}`);
      }

      this.#loadedLearnerGroupWithCourses.set(
        learnerGroupId,
        this.store.findRecord('learner-group', learnerGroupId, {
          reload: true,
          include: includes.join(','),
        })
      );
    }

    return this.#loadedLearnerGroupWithCourses.get(learnerGroupId);
  }
  async loadCohortLearnerGroups(cohortId) {
    if (!this.#loadedCohortLearnerGroups.has(cohortId)) {
      const includes = ['programYear.program.school', 'users.learnerGroups'];
      for (let i = 0; i < 5; i++) {
        const children = 'children.'.repeat(i);
        includes.push(`learnerGroups.${children}children`);
        includes.push(`learnerGroups.${children}instructors`);
      }

      this.#loadedCohortLearnerGroups.set(
        cohortId,
        this.store.findRecord('cohort', cohortId, {
          reload: true,
          include: includes.join(','),
        })
      );
    }

    return this.#loadedCohortLearnerGroups.get(cohortId);
  }
  async loadLearnerGroup(learnerGroupId) {
    if (!this.#loadedLearnerGroup.has(learnerGroupId)) {
      const sessionIncludes = 'offerings.session.course';
      const ilmIncludes = 'ilmSessions.session.course';
      const includes = ['cohort.programYear.program.school', 'children'];
      for (let i = 0; i < 5; i++) {
        const children = 'children.'.repeat(i);
        includes.push(`${children}${sessionIncludes}`);
        includes.push(`${children}${ilmIncludes}`);
      }

      this.#loadedLearnerGroup.set(
        learnerGroupId,
        this.store.findRecord('learner-group', learnerGroupId, {
          reload: true,
          include: includes.join(','),
        })
      );
    }

    return this.#loadedLearnerGroup.get(learnerGroupId);
  }
  async loadInstructorGroupsForSchool(schoolId) {
    if (!this.#loadedSchoolInstructorGroups.has(schoolId)) {
      this.#loadedSchoolInstructorGroups.set(
        schoolId,
        this.store.findRecord('school', schoolId, {
          reload: true,
          include: 'instructorGroups.users',
        })
      );
    }

    return this.#loadedSchoolInstructorGroups.get(schoolId);
  }
  async loadUserProfile(id) {
    if (!this.#loadedUserProfiles.has(id)) {
      const includes = [
        'directedCourses.sessions',
        'administeredCourses.sessions',
        'studentAdvisedCourses.sessions',
        'studentAdvisedSessions.course',
        'learnerGroups.offerings.session.course',
        'learnerGroups.ilmSessions.session.course',
        'instructedLearnerGroups.offerings.session.course',
        'instructedLearnerGroups.ilmSessions.session.course',
        'instructorGroups.offerings.session.course',
        'instructorGroups.ilmSessions.session.course',
        'instructorIlmSessions.session.course',
        'learnerIlmSessions.session.course',
        'offerings.session.course',
        'instructedOfferings.session.course',
        'programYears',
        'directedSchools',
        'administeredSchools',
        'administeredSessions',
        'directedPrograms',
        'cohorts.programYear.program',
        'primaryCohort',
        'administeredCurriculumInventoryReports',
        'roles',
      ];
      this.#loadedUserProfiles.set(
        id,
        this.store.findRecord('user', id, {
          reload: true,
          include: includes.join(','),
        })
      );
    }

    return this.#loadedUserProfiles.get(id);
  }
}
