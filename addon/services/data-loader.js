import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class DataLoaderService extends Service {
  @service store;
  #calendarSchools = {};
  #coursesSchools = {};
  #learnerGroupSchools = {};
  #learnerGroupCohorts = {};
  #courses = {};
  #courseSessions = {};
  async loadSchoolForCalendar(id) {
    if (!(id in this.#calendarSchools)) {
      this.#calendarSchools[id] = this.store.findRecord('school', id, {
        include: 'programs.programYears.cohort,sessionTypes,vocabularies.terms,courses',
        reload: true,
      });
    }

    return this.#calendarSchools[id];
  }
  async loadCourse(id) {
    if (!(id in this.#courses)) {
      const relationships = [
        'clerkshipType',
        'courseObjectives.objective.parents',
        'courseObjectives.objective.meshDescriptors',
        'courseObjectives.terms.vocabulary',
        'learningMaterials.learningMaterial.owningUser',
        'directors',
        'school.sessionTypes',
        'school.configurations',
        'school.competencies',
        'administrators',
        'directors',
        'meshDescriptors.trees',
        'cohorts.programYear.program',
        'cohorts.programYear.programYearObjectives.objective',
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
        'sessionObjectives.objective.parents',
        'sessionObjectives.objective.meshDescriptors',
        'sessionObjectives.terms.vocabulary',
        'offerings.learners',
        'offerings.instructors',
        'offerings.instructorGroups.users',
        'offerings.learnerGroups.users',
        'ilmSession.learners',
        'ilmSession.instructors',
        'ilmSession.instructorGroups.users',
        'ilmSession.learnerGroups.users',
        'sessionDescription',
        'terms.vocabulary',
        'terms.parent.parent.parent',
        'meshDescriptors.trees',
      ];
      const sessionIncludes = sessionRelationships.reduce((includes, item) => {
        return `${includes}sessions.${item},`;
      }, '');
      this.#courseSessions[id] = this.store.findRecord('course', id, {
        include: sessionIncludes,
        reload: true,
      });
    }
    return this.#courseSessions[id];
  }
}
