import { isEmpty } from '@ember/utils';
import { get } from '@ember/object';
import Service, { service } from '@ember/service';
import { DateTime } from 'luxon';
import jwtDecode from 'ilios-common/utils/jwt-decode';
import { uniqueValues } from 'ilios-common/utils/array-helpers';

export default class CurrentUserService extends Service {
  @service store;
  @service session;
  @service router;

  _userPromise = null;

  get currentUserId() {
    if (
      !this.session ||
      !this.session.data ||
      !this.session.data.authenticated ||
      !this.session.data.authenticated.jwt
    ) {
      return null;
    }
    const obj = jwtDecode(this.session.data.authenticated.jwt);

    return obj?.user_id;
  }

  async getModel() {
    const currentUserId = this.currentUserId;
    if (!currentUserId) {
      return null;
    }
    const user = this.store.peekRecord('user', currentUserId);
    if (user) {
      return user;
    }

    if (!this._userPromise) {
      this._userPromise = this.store.findRecord('user', currentUserId, {
        include: 'sessionMaterialStatuses',
      });
    }
    return await this._userPromise;
  }

  async getUserRoleTitles() {
    const user = await this.getModel();
    if (!user) {
      return [];
    }
    const roles = await user.get('roles');
    return roles.map((role) => role.get('title').toLowerCase());
  }

  async getIsStudent() {
    const roleTitles = await this.getUserRoleTitles();
    return roleTitles.includes('student');
  }

  async isFormerStudent() {
    const roleTitles = await this.getUserRoleTitles();
    return roleTitles.includes('former student');
  }

  async getActiveRelatedCoursesInThisYearAndLastYear() {
    const user = await this.getModel();
    if (isEmpty(user)) {
      return [];
    }
    let currentYear = DateTime.now().year;
    const currentMonth = DateTime.now().month;
    if (currentMonth < 6) {
      currentYear--;
    }
    const previousYear = currentYear - 1;
    const nextYear = currentYear + 1;
    return await this.store.query('course', {
      my: true,
      filters: {
        year: [previousYear, currentYear, nextYear],
        locked: false,
        archived: false,
      },
    });
  }

  getBooleanAttributeFromToken(attribute) {
    const session = this.session;
    if (isEmpty(session)) {
      return false;
    }

    const jwt = session.get('data.authenticated.jwt');

    if (isEmpty(jwt)) {
      return false;
    }
    const obj = jwtDecode(jwt);

    return !!get(obj, attribute);
  }
  get isRoot() {
    return this.getBooleanAttributeFromToken('is_root');
  }
  get performsNonLearnerFunction() {
    return this.getBooleanAttributeFromToken('performs_non_learner_function');
  }
  get canCreateOrUpdateUserInAnySchool() {
    return this.getBooleanAttributeFromToken('can_create_or_update_user_in_any_school');
  }
  async isDirectingSchool(school) {
    const user = await this.getModel();
    const ids = user.hasMany('directedSchools').ids();
    return ids.includes(school.get('id'));
  }
  async isAdministeringSchool(school) {
    const user = await this.getModel();
    const ids = user.hasMany('administeredSchools').ids();
    return ids.includes(school.get('id'));
  }
  async isDirectingProgramInSchool(school) {
    const user = await this.getModel();
    const schoolProgramIds = school.hasMany('programs').ids();

    const ids = user.hasMany('directedPrograms').ids();
    const matches = ids.filter((id) => schoolProgramIds.includes(id));

    return matches.length > 0;
  }
  async isDirectingCourseInSchool(school) {
    const user = await this.getModel();
    const schoolCourseIds = school.hasMany('courses').ids();

    const ids = user.hasMany('directedCourses').ids();
    const matches = ids.filter((id) => schoolCourseIds.includes(id));

    return matches.length > 0;
  }
  async isAdministeringCourseInSchool(school) {
    const user = await this.getModel();
    const schoolCourseIds = school.hasMany('courses').ids();

    const ids = user.hasMany('administeredCourses').ids();
    const matches = ids.filter((id) => schoolCourseIds.includes(id));

    return matches.length > 0;
  }
  async isAdministeringSessionInSchool(school) {
    const user = await this.getModel();
    const schoolCourseIds = school.hasMany('courses').ids();

    const sessions = await user.get('administeredSessions');
    const matches = sessions.filter((session) =>
      schoolCourseIds.includes(session.belongsTo('course').id()),
    );

    return matches.length > 0;
  }
  async isTeachingCourseInSchool(school) {
    const schoolCourseIds = school.hasMany('courses').ids();
    if (!schoolCourseIds.length) {
      return false;
    }
    const courses = await this.getAllInstructedCourses();
    const matches = courses.filter((course) => schoolCourseIds.includes(course.id));

    return matches.length > 0;
  }
  async isAdministeringCurriculumInventoryReportInSchool(school) {
    const user = await this.getModel();
    const schoolProgramIds = school.hasMany('programs').ids();

    const reports = await user.get('administeredCurriculumInventoryReports');
    const matches = reports.filter((report) =>
      schoolProgramIds.includes(report.belongsTo('program').id()),
    );

    return matches.length > 0;
  }
  async isDirectingCourse(course) {
    const user = await this.getModel();

    const ids = user.hasMany('directedCourses').ids();

    return ids.includes(course.get('id'));
  }
  async isAdministeringCourse(course) {
    const user = await this.getModel();

    const ids = user.hasMany('administeredCourses').ids();

    return ids.includes(course.get('id'));
  }
  async isAdministeringSessionInCourse(course) {
    const user = await this.getModel();

    const sessions = await user.get('administeredSessions');
    const matches = sessions.filter(
      (session) => course.get('id') === session.belongsTo('course').id(),
    );

    return matches.length > 0;
  }
  async isTeachingCourse(course) {
    const courses = await this.getAllInstructedCourses();
    const matches = courses.filter((c) => c.id === course.id);
    return matches.length > 0;
  }
  async isAdministeringSession(session) {
    const user = await this.getModel();

    const ids = user.hasMany('administeredSessions').ids();

    return ids.includes(session.get('id'));
  }
  async isTeachingSession(session) {
    const sessions = await this.getAllInstructedSessions();
    const matches = sessions.filter((s) => s.id === session.id);

    return matches.length > 0;
  }
  async isDirectingProgram(program) {
    const user = await this.getModel();

    const ids = user.hasMany('directedPrograms').ids();

    return ids.includes(program.get('id'));
  }
  async isDirectingProgramYearInProgram(program) {
    const user = await this.getModel();

    const programYears = await user.get('programYears');
    const matches = programYears.filter(
      (programYear) => program.get('id') === programYear.belongsTo('program').id(),
    );

    return matches.length > 0;
  }
  async isDirectingProgramYear(programYear) {
    const user = await this.getModel();

    const ids = user.hasMany('programYears').ids();

    return ids.includes(programYear.get('id'));
  }
  async isAdministeringCurriculumInventoryReport(report) {
    const user = await this.getModel();

    const ids = user.hasMany('administeredCurriculumInventoryReports').ids();

    return ids.includes(report.get('id'));
  }
  async getRolesInSchool(school, rolesToCheck = []) {
    const roles = [];
    if (rolesToCheck.includes('SCHOOL_DIRECTOR') && (await this.isDirectingSchool(school))) {
      roles.push('SCHOOL_DIRECTOR');
    }
    if (
      rolesToCheck.includes('SCHOOL_ADMINISTRATOR') &&
      (await this.isAdministeringSchool(school))
    ) {
      roles.push('SCHOOL_ADMINISTRATOR');
    }
    if (
      rolesToCheck.includes('PROGRAM_DIRECTOR') &&
      (await this.isDirectingProgramInSchool(school))
    ) {
      roles.push('PROGRAM_DIRECTOR');
    }
    if (
      rolesToCheck.includes('COURSE_DIRECTOR') &&
      (await this.isDirectingCourseInSchool(school))
    ) {
      roles.push('COURSE_DIRECTOR');
    }
    if (
      rolesToCheck.includes('COURSE_ADMINISTRATOR') &&
      (await this.isAdministeringCourseInSchool(school))
    ) {
      roles.push('COURSE_ADMINISTRATOR');
    }
    if (
      rolesToCheck.includes('SESSION_ADMINISTRATOR') &&
      (await this.isAdministeringSessionInSchool(school))
    ) {
      roles.push('SESSION_ADMINISTRATOR');
    }
    if (
      rolesToCheck.includes('COURSE_INSTRUCTOR') &&
      (await this.isTeachingCourseInSchool(school))
    ) {
      roles.push('COURSE_INSTRUCTOR');
    }
    if (
      rolesToCheck.includes('CURRICULUM_INVENTORY_REPORT_ADMINISTRATOR') &&
      (await this.isAdministeringCurriculumInventoryReportInSchool(school))
    ) {
      roles.push('CURRICULUM_INVENTORY_REPORT_ADMINISTRATOR');
    }

    return roles;
  }
  async getRolesInCourse(course, rolesToCheck = []) {
    const roles = [];
    if (rolesToCheck.includes('COURSE_DIRECTOR') && (await this.isDirectingCourse(course))) {
      roles.push('COURSE_DIRECTOR');
    }
    if (
      rolesToCheck.includes('COURSE_ADMINISTRATOR') &&
      (await this.isAdministeringCourse(course))
    ) {
      roles.push('COURSE_ADMINISTRATOR');
    }
    if (
      rolesToCheck.includes('SESSION_ADMINISTRATOR') &&
      (await this.isAdministeringSessionInCourse(course))
    ) {
      roles.push('SESSION_ADMINISTRATOR');
    }
    if (rolesToCheck.includes('COURSE_INSTRUCTOR') && (await this.isTeachingCourse(course))) {
      roles.push('COURSE_INSTRUCTOR');
    }

    return roles;
  }
  async getRolesInSession(session, rolesToCheck = []) {
    const roles = [];
    if (
      rolesToCheck.includes('SESSION_ADMINISTRATOR') &&
      (await this.isAdministeringSession(session))
    ) {
      roles.push('SESSION_ADMINISTRATOR');
    }
    if (rolesToCheck.includes('SESSION_INSTRUCTOR') && (await this.isTeachingSession(session))) {
      roles.push('SESSION_INSTRUCTOR');
    }

    return roles;
  }
  async getRolesInProgram(program, rolesToCheck = []) {
    const roles = [];
    if (rolesToCheck.includes('PROGRAM_DIRECTOR') && (await this.isDirectingProgram(program))) {
      roles.push('PROGRAM_DIRECTOR');
    }
    if (
      rolesToCheck.includes('PROGRAM_YEAR_DIRECTOR') &&
      (await this.isDirectingProgramYearInProgram(program))
    ) {
      roles.push('PROGRAM_YEAR_DIRECTOR');
    }

    return roles;
  }
  async getRolesInProgramYear(programYear, rolesToCheck = []) {
    const roles = [];
    if (
      rolesToCheck.includes('PROGRAM_YEAR_DIRECTOR') &&
      (await this.isDirectingProgramYear(programYear))
    ) {
      roles.push('PROGRAM_YEAR_DIRECTOR');
    }

    return roles;
  }
  async getRolesInCurriculumInventoryReport(report, rolesToCheck = []) {
    const roles = [];
    if (
      rolesToCheck.includes('CURRICULUM_INVENTORY_REPORT_ADMINISTRATOR') &&
      (await this.isAdministeringCurriculumInventoryReport(report))
    ) {
      roles.push('CURRICULUM_INVENTORY_REPORT_ADMINISTRATOR');
    }

    return roles;
  }

  /**
   * Returns a list of all courses that this user is instructing in.
   * This entails the following user-to-course relationship paths:
   * - instructor -> ILMs-> sessions -> courses
   * - instructor -> instructor-groups -> ILMs -> sessions -> courses
   * - instructor -> learner-groups -> ILMs -> sessions -> courses
   * - instructor -> offerings -> sessions -> courses
   * - instructor -> instructor-groups -> offerings -> sessions -> courses
   * - instructor -> learner-groups -> offerings -> sessions -> courses
   */
  async getAllInstructedCourses() {
    const sessions = await this.getAllInstructedSessions();
    const courses = await Promise.all(sessions.map((s) => s.course));
    return uniqueValues(courses);
  }

  /**
   * Returns a list of all sessions that this user is instructing in.
   * This entails the following user-to-session relationship paths:
   * - instructor -> ILMs-> sessions
   * - instructor -> instructor-groups -> ILMs -> sessions
   * - instructor -> learner-groups -> ILMs -> sessions
   * - instructor -> offerings -> sessions
   * - instructor -> instructor-groups -> offerings -> sessions
   * - instructor -> learner-groups -> offerings -> sessions
   */
  async getAllInstructedSessions() {
    const user = await this.getModel();
    const instructedIlms = await user.instructorIlmSessions;
    const instructedLearnerGroups = await user.instructedLearnerGroups;
    const instructorGroups = await user.instructorGroups;

    // instructor -> ILMs -> sessions
    const instructedIlmsSessions = await Promise.all(instructedIlms.map((t) => t.session));

    // instructor -> instructor-groups -> ILMs -> sessions
    const instructorGroupsIlms = await Promise.all(instructorGroups.map((i) => i.ilmSessions));
    const instructorGroupsIlmsSessions = await Promise.all(
      instructorGroupsIlms.flat().map((ilm) => ilm.session),
    );

    // instructor -> learner-groups -> ILMs -> sessions
    const learnerGroupsIlms = await Promise.all(instructedLearnerGroups.map((i) => i.ilmSessions));
    const learnerGroupsIlmsSessions = await Promise.all(
      learnerGroupsIlms.flat().map((ilm) => ilm.session),
    );

    // instructor -> offerings -> sessions
    const instructedOfferings = await user.instructedOfferings;
    const instructedOfferingsSessions = await Promise.all(
      instructedOfferings.map((t) => t.session),
    );

    // instructor -> instructor-groups -> offerings -> sessions
    const instructorGroupsOfferings = await Promise.all(instructorGroups.map((i) => i.offerings));
    const instructorGroupsOfferingsSessions = await Promise.all(
      instructorGroupsOfferings.flat().map((offering) => offering.session),
    );

    // instructor -> learner-groups -> offerings -> sessions
    const learnerGroupsOfferings = await Promise.all(
      instructedLearnerGroups.map((i) => i.offerings),
    );
    const learnerGroupsOfferingsSessions = await Promise.all(
      learnerGroupsOfferings.flat().map((offering) => offering.session),
    );

    return uniqueValues(
      [
        ...instructedIlmsSessions,
        ...instructorGroupsIlmsSessions,
        ...learnerGroupsIlmsSessions,
        ...instructedOfferingsSessions,
        ...instructorGroupsOfferingsSessions,
        ...learnerGroupsOfferingsSessions,
      ].filter(Boolean),
    );
  }

  /**
   * Utility method for checking that the current user is properly authenticated and authorized.
   * Re-route the user to the login screen if unauthenticated, or to the 404/Not-found page if unauthorized.
   * Invoke this method in `beforeModel()` hooks of our administration routes.
   * @param {object} transition See https://api.emberjs.com/ember/release/classes/transition/.
   * @return {boolean} TRUE if authentication and authorization checks passed successfully, FALSE otherwise.
   */
  requireNonLearner(transition) {
    // Authentication check.
    if (!this.session.requireAuthentication(transition, 'login')) {
      return false;
    }

    // Authorization check.
    if (!this.performsNonLearnerFunction) {
      // Slash on the route name is necessary here due to this bug:
      // https://github.com/emberjs/ember.js/issues/12945
      this.router.replaceWith('/four-oh-four');
      return false;
    }

    return true;
  }
}
