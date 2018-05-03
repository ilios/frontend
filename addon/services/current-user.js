import { isEmpty } from '@ember/utils';
import { get, computed } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import moment from 'moment';
import jwtDecode from '../utils/jwt-decode';

export default Service.extend({
  store: service(),
  session: service(),
  currentUserId: computed('session.data.authenticated.jwt', function(){
    const session = this.get('session');
    if(isEmpty(session)){
      return null;
    }

    const jwt = session.get('data.authenticated.jwt');

    if(isEmpty(jwt)){
      return null;
    }
    const obj = jwtDecode(jwt);

    return get(obj, 'user_id');
  }),

  model: computed('currentUserId', async function(){
    let currentUserId = this.get('currentUserId');
    if (!currentUserId) {
      return null;
    }
    return await this.get('store').find('user', currentUserId);
  }),

  userRoleTitles: computed('model.roles.[]', async function(){
    const user = await this.get('model');
    if(!user) {
      return [];
    }
    const roles = await user.get('roles');
    return roles.map(role => role.get('title').toLowerCase());
  }),
  userIsStudent: computed('useRoleTitles.[]', async function(){
    const roleTitles = await this.get('userRoleTitles');
    return roleTitles.includes('student');
  }),
  userIsFormerStudent: computed('useRoleTitles.[]', async function(){
    const roleTitles = await this.get('userRoleTitles');
    return roleTitles.includes('former student');
  }),
  activeRelatedCoursesInThisYearAndLastYear: computed(
    'model',
    'model.instructedOfferings.[]',
    'model.instructorGroups.[]',
    'model.instructedLearnerGroups.[]',
    'model.directedCourses.[]',
    'model.instructorIlmSessions.[]',
    async function(){
      const user = await this.get('model');
      if(isEmpty(user)){
        return [];
      }
      let currentYear = moment().format('YYYY');
      const currentMonth = parseInt(moment().format('M'), 10);
      if(currentMonth < 6){
        currentYear--;
      }
      const previousYear = currentYear -1;
      const nextYear = currentYear +1;
      return await this.get('store').query('course', {
        my: true,
        filters: {
          year: [previousYear, currentYear, nextYear],
          locked: false,
          archived: false
        }
      });
    }
  ),
  getBooleanAttributeFromToken(attribute) {
    const session = this.get('session');
    if(isEmpty(session)){
      return false;
    }

    const jwt = session.get('data.authenticated.jwt');

    if(isEmpty(jwt)){
      return false;
    }
    const obj = jwtDecode(jwt);

    return !!get(obj, attribute);
  },
  isRoot: computed('session.data.authenticated.jwt', function(){
    return this.getBooleanAttributeFromToken('is_root');
  }),
  performsNonLearnerFunction: computed('session.data.authenticated.jwt', function(){
    return this.getBooleanAttributeFromToken('performs_non_learner_function');
  }),
  canCreateOrUpdateUserInAnySchool: computed('session.data.authenticated.jwt', function(){
    return this.getBooleanAttributeFromToken('can_create_or_update_user_in_any_school');
  }),
  canCreateCIReportInAnySchool: computed('session.data.authenticated.jwt', function(){
    return this.getBooleanAttributeFromToken('can_create_curriculum_inventory_report_in_any_school');
  }),
  async isDirectingSchool(school) {
    const user = await this.get('model');
    const ids = user.hasMany('directedSchools').ids();
    return ids.includes(school.get('id'));
  },
  async isAdministeringSchool(school) {
    const user = await this.get('model');
    const ids = user.hasMany('administeredSchools').ids();
    return ids.includes(school.get('id'));
  },
  async isDirectingCourseInSchool(school) {
    const user = await this.get('model');
    const schoolCourseIds = school.hasMany('courses').ids();

    const ids = user.hasMany('directedCourses').ids();
    const matches = ids.filter(id => schoolCourseIds.includes(id));

    return matches.length > 0;
  },
  async isAdministeringCourseInSchool(school) {
    const user = await this.get('model');
    const schoolCourseIds = school.hasMany('courses').ids();

    const ids = user.hasMany('administeredCourses').ids();
    const matches = ids.filter(id => schoolCourseIds.includes(id));

    return matches.length > 0;
  },
  async isAdministeringSessionInSchool(school) {
    const user = await this.get('model');
    const schoolCourseIds = school.hasMany('courses').ids();

    const sessions = await user.get('administeredSessions');
    const matches = sessions.filter(session => schoolCourseIds.includes(session.belongsTo('course').id()));

    return matches.length > 0;
  },
  async isTeachingCourseInSchool(school) {
    const user = await this.get('model');
    const schoolCourseIds = school.hasMany('courses').ids();

    const courses = await user.get('allInstructedCourses');
    const matches = courses.filter(course => schoolCourseIds.includes(course.get('id')));

    return matches.length > 0;
  },
  async isAdministeringCurriculumInventoryReportInSchool(school) {
    const user = await this.get('model');
    const schoolProgramIds = school.hasMany('programs').ids();

    const reports = await user.get('administeredCurriculumInventoryReports');
    const matches = reports.filter(report => schoolProgramIds.includes(report.belongsTo('program').id()));

    return matches.length > 0;
  },
  async isDirectingCourse(course) {
    const user = await this.get('model');

    const ids = user.hasMany('directedCourses').ids();

    return ids.includes(course.get('id'));
  },
  async isAdministeringCourse(course) {
    const user = await this.get('model');

    const ids = user.hasMany('administeredCourses').ids();

    return ids.includes(course.get('id'));
  },
  async isAdministeringSessionInCourse(course) {
    const user = await this.get('model');

    const sessions = await user.get('administeredSessions');
    const matches = sessions.filter(session => course.get('id') === session.belongsTo('course').id());

    return matches.length > 0;
  },
  async isTeachingCourse(course) {
    const user = await this.get('model');

    const courses = await user.get('allInstructedCourses');
    const matches = courses.filterBy('id', course.get('id'));

    return matches.length > 0;
  },
  async isAdministeringSession(session) {
    const user = await this.get('model');

    const ids = user.hasMany('administeredSessions').ids();

    return ids.includes(session.get('id'));
  },
  async isTeachingSession(session) {
    const user = await this.get('model');

    const sessions = await user.get('allInstructedSessions');
    const matches = sessions.filterBy('id', session.get('id'));

    return matches.length > 0;
  },
  async isDirectingProgram(program) {
    const user = await this.get('model');

    const ids = user.hasMany('directedPrograms').ids();

    return ids.includes(program.get('id'));
  },
  async isDirectingProgramYearInProgram(program) {
    const user = await this.get('model');

    const programYears = await user.get('programYears');
    const matches = programYears.filter(programYear => program.get('id') === programYear.belongsTo('program').id());

    return matches.length > 0;
  },
  async isDirectingProgramYear(programYear) {
    const user = await this.get('model');

    const ids = user.hasMany('programYears').ids();

    return ids.includes(programYear.get('id'));
  },
  async isAdministeringCurriculumInventoryReport(report) {
    const user = await this.get('model');

    const ids = user.hasMany('administeredCurriculumInventoryReports').ids();

    return ids.includes(report.get('id'));
  },
  async getRolesInSchool(school) {
    let roles = [];
    if (await this.isDirectingSchool(school)) {
      roles.pushObject('SCHOOL_DIRECTOR');
    }
    if (await this.isAdministeringSchool(school)) {
      roles.pushObject('SCHOOL_ADMINISTRATOR');
    }
    if (await this.isDirectingCourseInSchool(school)) {
      roles.pushObject('COURSE_DIRECTOR');
    }
    if (await this.isAdministeringCourseInSchool(school)) {
      roles.pushObject('COURSE_ADMINISTRATOR');
    }
    if (await this.isAdministeringSessionInSchool(school)) {
      roles.pushObject('SESSION_ADMINISTRATOR');
    }
    if (await this.isTeachingCourseInSchool(school)) {
      roles.pushObject('COURSE_INSTRUCTOR');
    }
    if (await this.isAdministeringCurriculumInventoryReportInSchool(school)) {
      roles.pushObject('CURRICULUM_INVENTORY_REPORT_ADMINISTRATOR');
    }

    return roles;
  },
  async getRolesInCourse(course) {
    let roles = [];
    if (await this.isDirectingCourse(course)) {
      roles.pushObject('COURSE_DIRECTOR');
    }
    if (await this.isAdministeringCourse(course)) {
      roles.pushObject('COURSE_ADMINISTRATOR');
    }
    if (await this.isAdministeringSessionInCourse(course)) {
      roles.pushObject('SESSION_ADMINISTRATOR');
    }
    if (await this.isTeachingCourse(course)) {
      roles.pushObject('COURSE_INSTRUCTOR');
    }

    return roles;
  },
  async getRolesInSession(session) {
    let roles = [];
    if (await this.isAdministeringSession(session)) {
      roles.pushObject('SESSION_ADMINISTRATOR');
    }
    if (await this.isTeachingSession(session)) {
      roles.pushObject('SESSION_INSTRUCTOR');
    }

    return roles;
  },
  async getRolesInProgram(program) {
    let roles = [];
    if (await this.isDirectingProgram(program)) {
      roles.pushObject('PROGRAM_DIRECTOR');
    }
    if (await this.isDirectingProgramYearInProgram(program)) {
      roles.pushObject('PROGRAM_YEAR_DIRECTOR');
    }

    return roles;
  },
  async getRolesInProgramYear(programYear) {
    let roles = [];
    if (await this.isDirectingProgramYear(programYear)) {
      roles.pushObject('PROGRAM_YEAR_DIRECTOR');
    }

    return roles;
  },
  async getRolesInCurriculumInventoryReport(report) {
    let roles = [];
    if (await this.isAdministeringCurriculumInventoryReport(report)) {
      roles.pushObject('CURRICULUM_INVENTORY_REPORT_ADMINISTRATOR');
    }

    return roles;
  },
});
