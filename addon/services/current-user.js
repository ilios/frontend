import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
import { get, computed } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import moment from 'moment';
import jwtDecode from '../utils/jwt-decode';

const { map } = RSVP;

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

  /**
   * All cohorts from all schools that the current user is associated with,
   * via primary school association and the explicit schools permissions.
   * @property cohortsInAllAssociatedSchools
   * @type {Ember.computed}
   * @readOnly
   * @public
   */
  cohortsInAllAssociatedSchools: computed('model.schools.[]', async function(){
    const user = await this.get('model');
    if (!user) {
      return [];
    }
    const schools = await user.get('schools');
    const cohorts = await map(schools, async school => {
      const programs = await school.get('programs');
      const schoolCohorts = await map(programs.toArray(), async program => {
        return await program.get('cohorts');
      });
      return schoolCohorts.reduce((array, set) => {
        return array.pushObjects(set);
      }, []);
    });

    return cohorts.reduce((array, set) => {
      return array.pushObjects(set.toArray());
    }, []);
  }).readOnly(),

  userRoleTitles: computed('model.roles.[]', async function(){
    const user = await this.get('model');
    if(!user) {
      return [];
    }
    const roles = await user.get('roles');
    return roles.map(role => role.get('title').toLowerCase());
  }),

  userIsCourseDirector: computed('useRoleTitles.[]', async function(){
    const roleTitles = await this.get('userRoleTitles');
    return roleTitles.includes('course director');
  }),

  userIsFaculty: computed('useRoleTitles.[]', async function(){
    const roleTitles = await this.get('userRoleTitles');
    return roleTitles.includes('faculty');
  }),

  userIsDeveloper: computed('useRoleTitles.[]', async function(){
    const roleTitles = await this.get('userRoleTitles');
    return roleTitles.includes('developer');

  }),
  userIsStudent: computed('useRoleTitles.[]', async function(){
    const roleTitles = await this.get('userRoleTitles');
    return roleTitles.includes('student');
  }),
  userIsPublic: computed('useRoleTitles.[]', async function(){
    const roleTitles = await this.get('userRoleTitles');
    return roleTitles.includes('public');
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
  isRoot: computed('session.data.authenticated.jwt', function(){
    const session = this.get('session');
    if(isEmpty(session)){
      return null;
    }

    const jwt = session.get('data.authenticated.jwt');

    if(isEmpty(jwt)){
      return null;
    }
    const obj = jwtDecode(jwt);

    return !!get(obj, 'is_root');
  }),
  schools: computed('model.schools', async function () {
    const model = await this.get('model');
    return model.get('schools');
  }),
  async isDirectingSchool(schoolId) {
    const user = await this.get('model');
    const ids = user.hasMany('directedSchools').ids();
    return ids.includes(schoolId);
  },
  async isAdministeringSchool(schoolId) {
    const user = await this.get('model');
    const ids = user.hasMany('administeredSchools').ids();
    return ids.includes(schoolId);
  },
  async isDirectingCourseInSchool(schoolId) {
    const user = await this.get('model');
    const schools = await this.get('schools');
    const school = schools.findBy('id', schoolId);
    const schoolCourseIds = school.hasMany('courses').ids();

    const ids = user.hasMany('directedCourses').ids();
    const matches = ids.filter(id => schoolCourseIds.includes(id));

    return matches.length > 0;
  },
  async isAdministeringCourseInSchool(schoolId) {
    const user = await this.get('model');
    const schools = await this.get('schools');
    const school = schools.findBy('id', schoolId);
    const schoolCourseIds = school.hasMany('courses').ids();

    const ids = user.hasMany('administeredCourses').ids();
    const matches = ids.filter(id => schoolCourseIds.includes(id));

    return matches.length > 0;
  },
  async isAdministeringSessionInSchool(schoolId) {
    const user = await this.get('model');
    const schools = await this.get('schools');
    const school = schools.findBy('id', schoolId);
    const schoolCourseIds = school.hasMany('courses').ids();

    const sessions = await user.get('administeredSessions');
    const matches = sessions.filter(session => schoolCourseIds.includes(session.belongsTo('course').id()));

    return matches.length > 0;
  },
  async isTeachingCourseInSchool(schoolId) {
    const user = await this.get('model');
    const schools = await this.get('schools');
    const school = schools.findBy('id', schoolId);
    const schoolCourseIds = school.hasMany('courses').ids();

    const courses = await user.get('allInstructedCourses');
    const matches = courses.filter(course => schoolCourseIds.includes(course.get('id')));

    return matches.length > 0;
  },
  async isAdministeringCurriculumInventoryReportInSchool(schoolId) {
    const user = await this.get('model');
    const schools = await this.get('schools');
    const school = schools.findBy('id', schoolId);
    const schoolProgramIds = school.hasMany('programs').ids();

    const reports = await user.get('administeredCurriculumInventoryReports');
    const matches = reports.filter(report => schoolProgramIds.includes(report.belongsTo('program').id()));

    return matches.length > 0;
  },
  async isDirectingCourse(courseId) {
    const user = await this.get('model');

    const ids = user.hasMany('directedCourses').ids();
    const matches = ids.filterBy('id', courseId);

    return matches.length > 0;
  },
  async isAdministeringCourse(courseId) {
    const user = await this.get('model');

    const ids = user.hasMany('administeredCourses').ids();
    const matches = ids.filterBy('id', courseId);

    return matches.length > 0;
  },
  async isAdministeringSessionInCourse(courseId) {
    const user = await this.get('model');

    const sessions = await user.get('administeredSessions');
    const matches = sessions.filter(session => courseId === session.belongsTo('course').id());

    return matches.length > 0;
  },
  async isTeachingCourse(courseId) {
    const user = await this.get('model');

    const courses = await user.get('allInstructedCourses');
    const matches = courses.filterBy('id', courseId);

    return matches.length > 0;
  },
  async getRolesInSchool(schoolId) {
    let roles = [];
    if (await this.isDirectingSchool(schoolId)) {
      roles.pushObject('SCHOOL_DIRECTOR');
    }
    if (await this.isAdministeringSchool(schoolId)) {
      roles.pushObject('SCHOOL_ADMINISTRATOR');
    }
    if (await this.isDirectingCourseInSchool(schoolId)) {
      roles.pushObject('COURSE_DIRECTOR');
    }
    if (await this.isAdministeringCourseInSchool(schoolId)) {
      roles.pushObject('COURSE_ADMINISTRATOR');
    }
    if (await this.isAdministeringSessionInSchool(schoolId)) {
      roles.pushObject('SESSION_ADMINISTRATOR');
    }
    if (await this.isTeachingCourseInSchool(schoolId)) {
      roles.pushObject('COURSE_INSTRUCTOR');
    }
    if (await this.isAdministeringCurriculumInventoryReportInSchool(schoolId)) {
      roles.pushObject('CURRICULUM_INVENTORY_REPORT_ADMINISTRATOR');
    }

    return roles;
  },
  async getRolesInCourse(courseId) {
    let roles = [];
    if (await this.isDirectingCourse(courseId)) {
      roles.pushObject('COURSE_DIRECTOR');
    }
    if (await this.isAdministeringCourse(courseId)) {
      roles.pushObject('COURSE_ADMINISTRATOR');
    }
    if (await this.isAdministeringSessionInCourse(courseId)) {
      roles.pushObject('SESSION_ADMINISTRATOR');
    }
    if (await this.isTeachingCourse(courseId)) {
      roles.pushObject('COURSE_INSTRUCTOR');
    }

    return roles;
  },
});
