import { isEmpty } from '@ember/utils';
import { get } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import moment from 'moment';
import jwtDecode from '../utils/jwt-decode';

export default class CurrentUserService extends Service {
  @service store;
  @service session;
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

    return get(obj, 'user_id');
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
      this._userPromise = this.store.findRecord('user', currentUserId);
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
    let currentYear = moment().format('YYYY');
    const currentMonth = parseInt(moment().format('M'), 10);
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
      schoolCourseIds.includes(session.belongsTo('course').id())
    );

    return matches.length > 0;
  }
  async isTeachingCourseInSchool(school) {
    const user = await this.getModel();
    const schoolCourseIds = school.hasMany('courses').ids();

    const courses = await user.get('allInstructedCourses');
    const matches = courses.filter((course) => schoolCourseIds.includes(course.get('id')));

    return matches.length > 0;
  }
  async isAdministeringCurriculumInventoryReportInSchool(school) {
    const user = await this.getModel();
    const schoolProgramIds = school.hasMany('programs').ids();

    const reports = await user.get('administeredCurriculumInventoryReports');
    const matches = reports.filter((report) =>
      schoolProgramIds.includes(report.belongsTo('program').id())
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
      (session) => course.get('id') === session.belongsTo('course').id()
    );

    return matches.length > 0;
  }
  async isTeachingCourse(course) {
    const user = await this.getModel();

    const courses = await user.get('allInstructedCourses');
    const matches = courses.filterBy('id', course.get('id'));

    return matches.length > 0;
  }
  async isAdministeringSession(session) {
    const user = await this.getModel();

    const ids = user.hasMany('administeredSessions').ids();

    return ids.includes(session.get('id'));
  }
  async isTeachingSession(session) {
    const user = await this.getModel();

    const sessions = await user.get('allInstructedSessions');
    const matches = sessions.filterBy('id', session.get('id'));

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
      (programYear) => program.get('id') === programYear.belongsTo('program').id()
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
      roles.pushObject('SCHOOL_DIRECTOR');
    }
    if (
      rolesToCheck.includes('SCHOOL_ADMINISTRATOR') &&
      (await this.isAdministeringSchool(school))
    ) {
      roles.pushObject('SCHOOL_ADMINISTRATOR');
    }
    if (
      rolesToCheck.includes('PROGRAM_DIRECTOR') &&
      (await this.isDirectingProgramInSchool(school))
    ) {
      roles.pushObject('PROGRAM_DIRECTOR');
    }
    if (
      rolesToCheck.includes('COURSE_DIRECTOR') &&
      (await this.isDirectingCourseInSchool(school))
    ) {
      roles.pushObject('COURSE_DIRECTOR');
    }
    if (
      rolesToCheck.includes('COURSE_ADMINISTRATOR') &&
      (await this.isAdministeringCourseInSchool(school))
    ) {
      roles.pushObject('COURSE_ADMINISTRATOR');
    }
    if (
      rolesToCheck.includes('SESSION_ADMINISTRATOR') &&
      (await this.isAdministeringSessionInSchool(school))
    ) {
      roles.pushObject('SESSION_ADMINISTRATOR');
    }
    if (
      rolesToCheck.includes('COURSE_INSTRUCTOR') &&
      (await this.isTeachingCourseInSchool(school))
    ) {
      roles.pushObject('COURSE_INSTRUCTOR');
    }
    if (
      rolesToCheck.includes('CURRICULUM_INVENTORY_REPORT_ADMINISTRATOR') &&
      (await this.isAdministeringCurriculumInventoryReportInSchool(school))
    ) {
      roles.pushObject('CURRICULUM_INVENTORY_REPORT_ADMINISTRATOR');
    }

    return roles;
  }
  async getRolesInCourse(course, rolesToCheck = []) {
    const roles = [];
    if (rolesToCheck.includes('COURSE_DIRECTOR') && (await this.isDirectingCourse(course))) {
      roles.pushObject('COURSE_DIRECTOR');
    }
    if (
      rolesToCheck.includes('COURSE_ADMINISTRATOR') &&
      (await this.isAdministeringCourse(course))
    ) {
      roles.pushObject('COURSE_ADMINISTRATOR');
    }
    if (
      rolesToCheck.includes('SESSION_ADMINISTRATOR') &&
      (await this.isAdministeringSessionInCourse(course))
    ) {
      roles.pushObject('SESSION_ADMINISTRATOR');
    }
    if (rolesToCheck.includes('COURSE_INSTRUCTOR') && (await this.isTeachingCourse(course))) {
      roles.pushObject('COURSE_INSTRUCTOR');
    }

    return roles;
  }
  async getRolesInSession(session, rolesToCheck = []) {
    const roles = [];
    if (
      rolesToCheck.includes('SESSION_ADMINISTRATOR') &&
      (await this.isAdministeringSession(session))
    ) {
      roles.pushObject('SESSION_ADMINISTRATOR');
    }
    if (rolesToCheck.includes('SESSION_INSTRUCTOR') && (await this.isTeachingSession(session))) {
      roles.pushObject('SESSION_INSTRUCTOR');
    }

    return roles;
  }
  async getRolesInProgram(program, rolesToCheck = []) {
    const roles = [];
    if (rolesToCheck.includes('PROGRAM_DIRECTOR') && (await this.isDirectingProgram(program))) {
      roles.pushObject('PROGRAM_DIRECTOR');
    }
    if (
      rolesToCheck.includes('PROGRAM_YEAR_DIRECTOR') &&
      (await this.isDirectingProgramYearInProgram(program))
    ) {
      roles.pushObject('PROGRAM_YEAR_DIRECTOR');
    }

    return roles;
  }
  async getRolesInProgramYear(programYear, rolesToCheck = []) {
    const roles = [];
    if (
      rolesToCheck.includes('PROGRAM_YEAR_DIRECTOR') &&
      (await this.isDirectingProgramYear(programYear))
    ) {
      roles.pushObject('PROGRAM_YEAR_DIRECTOR');
    }

    return roles;
  }
  async getRolesInCurriculumInventoryReport(report, rolesToCheck = []) {
    const roles = [];
    if (
      rolesToCheck.includes('CURRICULUM_INVENTORY_REPORT_ADMINISTRATOR') &&
      (await this.isAdministeringCurriculumInventoryReport(report))
    ) {
      roles.pushObject('CURRICULUM_INVENTORY_REPORT_ADMINISTRATOR');
    }

    return roles;
  }
}
