import Service, { service } from '@ember/service';

export default class DataLoaderService extends Service {
  @service store;
  #calendarSchools = {};
  #coursesSchools = {};
  #learnerGroupSchools = null;
  #learnerGroupCohorts = {};
  #courses = {};
  #courseSessions = {};
  #academicYears = null;
  #loadedLearnerGroupWithCourses = new Map();
  #loadedLearnerGroup = new Map();
  #loadedSchoolInstructorGroups = new Map();
  #loadedCohortLearnerGroups = new Map();
  #loadedUserProfiles = new Map();
  #loadedInstructorGroup = new Map();
  #schoolSchools = new Map();

  async loadSchoolForCalendar(id) {
    if (!(id in this.#calendarSchools)) {
      const relationships = [
        'programs.programYears.cohort',
        'sessionTypes',
        'vocabularies.terms.children.children.children',
        'courses',
      ];
      const include = relationships.join(',');
      this.#calendarSchools[id] = this.store.findRecord('school', id, {
        include,
        reload: true,
      });
    }

    return this.#calendarSchools[id];
  }
  async loadSchoolForCourses(id) {
    // more comprehensive so if we already have it then use it.
    if (id in this.#calendarSchools) {
      return this.#calendarSchools[id];
    }
    if (!(id in this.#coursesSchools)) {
      const relationships = [
        'sessionTypes',
        'vocabularies.terms.children.children.children',
        'courses',
        'configurations',
      ];
      const include = relationships.join(',');
      this.#coursesSchools[id] = this.store.findRecord('school', id, {
        include,
        reload: true,
      });
    }
    return this.#coursesSchools[id];
  }
  async loadSchoolsForLearnerGroups() {
    if (!this.#learnerGroupSchools) {
      this.#learnerGroupSchools = this.store.findAll('school', {
        include: 'programs.programYears.cohort',
        reload: true,
      });
    }
    return this.#learnerGroupSchools;
  }
  async loadCohortForLearnerGroups(id) {
    if (!(id in this.#learnerGroupCohorts)) {
      this.#learnerGroupCohorts[id] = this.store.findRecord('cohort', id, {
        include: 'learnerGroups,users',
        reload: true,
      });
    }

    return this.#learnerGroupCohorts[id];
  }
  async loadCourse(id) {
    if (!(id in this.#courses)) {
      const relationships = [
        'clerkshipType',
        'courseObjectives.programYearObjectives',
        'courseObjectives.meshDescriptors',
        'courseObjectives.terms.vocabulary',
        'courseObjectives.programYearObjectives.competency',
        'learningMaterials.learningMaterial.owningUser',
        'directors',
        'administrators',
        'studentAdvisors',
        'meshDescriptors.trees',
        'cohorts.programYear.program',
        'cohorts.programYear.programYearObjectives',
        'cohorts.learnerGroups',
        'ancestor',
        'descendants',
        'terms.vocabulary',
        'terms.parent.parent.parent',
      ];
      const include = relationships.join(',');
      this.#courses[id] = this.store.findRecord('course', id, {
        include,
        reload: true,
      });
    }
    return this.#courses[id];
  }
  async loadCourseSessions(id) {
    if (!(id in this.#courseSessions)) {
      const sessionRelationships = [
        'learningMaterials.learningMaterial.owningUser',
        'sessionObjectives.courseObjectives',
        'sessionObjectives.meshDescriptors',
        'sessionObjectives.terms.vocabulary',
        'offerings.learners',
        'offerings.instructors',
        'offerings.instructorGroups.users',
        'offerings.learnerGroups.offerings',
        'offerings.learnerGroups.users',
        'ilmSession.learners',
        'ilmSession.instructors',
        'ilmSession.instructorGroups.users',
        'ilmSession.learnerGroups.users',
        'meshDescriptors.trees',
        'administrators',
        'studentAdvisors',
      ];
      const sessionIncludes = sessionRelationships.reduce((includes, item) => {
        return `${includes}${item},`;
      }, '');
      this.#courseSessions[id] = this.store.query('session', {
        filters: {
          course: id,
        },
        include: sessionIncludes,
      });
    }
    return this.#courseSessions[id];
  }
  async loadAcademicYears() {
    if (!this.#academicYears) {
      this.#academicYears = this.store.findAll('academic-year');
    }
    return this.#academicYears;
  }

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
        }),
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
        }),
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
        }),
      );
    }

    return this.#loadedLearnerGroup.get(learnerGroupId);
  }
  async loadInstructorGroup(instructorGroupId) {
    if (!this.#loadedInstructorGroup.has(instructorGroupId)) {
      this.#loadedInstructorGroup.set(
        instructorGroupId,
        this.store.findRecord('instructor-group', instructorGroupId, {
          reload: true,
          include: 'users,ilmSessions.session.course,offerings.session.course',
        }),
      );
    }

    return this.#loadedInstructorGroup.get(instructorGroupId);
  }
  async loadInstructorGroupsForSchool(schoolId) {
    if (!this.#loadedSchoolInstructorGroups.has(schoolId)) {
      this.#loadedSchoolInstructorGroups.set(
        schoolId,
        this.store.findRecord('school', schoolId, {
          reload: true,
          include: 'instructorGroups.users',
        }),
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
        }),
      );
    }

    return this.#loadedUserProfiles.get(id);
  }

  async loadSchoolForSchool(id) {
    if (!(id in this.#schoolSchools)) {
      const relationships = [
        'administrators',
        'competencies',
        'configurations',
        'directors',
        'sessionTypes',
        'vocabularies.terms.children.children.children',
        'curriculumInventoryInstitution',
        'programs.programYears.programYearObjectives',
      ];
      const include = relationships.join(',');
      this.#schoolSchools[id] = this.store.findRecord('school', id, {
        include,
        reload: true,
      });
    }
    return this.#schoolSchools[id];
  }
}
