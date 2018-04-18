import { computed } from '@ember/object';
import RSVP from 'rsvp';
import DS from 'ember-data';
import { A } from '@ember/array';

const { attr, belongsTo, hasMany, Model } = DS;
const { all, map } = RSVP;

export default Model.extend({
  lastName: attr('string'),
  firstName: attr('string'),
  middleName: attr('string'),
  phone: attr('string'),
  email:  attr('string'),
  addedViaIlios:  attr('boolean'),
  enabled:  attr('boolean'),
  campusId:  attr('string'),
  otherId:  attr('string'),
  examined:  attr('boolean'),
  userSyncIgnore:  attr('boolean'),
  icsFeedKey:  attr('string'),
  root: attr('boolean'),
  reminders: hasMany('user-made-reminder', {async: true}),
  reports: hasMany('report', {async: true}),
  school: belongsTo('school', {async: true}),
  authentication: belongsTo('authentication', {async: true}),
  directedCourses: hasMany('course', {
    async: true,
    inverse: 'directors'
  }),
  administeredCourses: hasMany('course', {
    async: true,
    inverse: 'administrators'
  }),
  learnerGroups: hasMany('learner-group', {
    async: true,
    inverse: 'users'
  }),
  instructedLearnerGroups: hasMany('learner-group', {
    async: true,
    inverse: 'instructors'
  }),
  instructorGroups: hasMany('instructor-group', {
    async: true,
    inverse: 'users'
  }),
  instructorIlmSessions: hasMany('ilm-session', {
    async: true,
    inverse: 'instructors'
  }),
  learnerIlmSessions: hasMany('ilm-session', {
    async: true,
    inverse: 'learners'
  }),
  offerings: hasMany('offering', {
    async: true,
    inverse: 'learners'
  }),
  instructedOfferings: hasMany('offering', {
    async: true,
    inverse: 'instructors'
  }),
  programYears: hasMany('program-year', {async: true}),
  roles: hasMany('user-role', {async: true}),
  directedSchools: hasMany('school', {
    async: true,
    inverse: 'directors'
  }),
  administeredSchools: hasMany('school', {
    async: true,
    inverse: 'administrators'
  }),
  administeredSessions: hasMany('session', {
    async: true,
    inverse: 'administrators'
  }),
  directedPrograms: hasMany('program', {
    async: true,
    inverse: 'directors'
  }),

  cohorts: hasMany('cohort', {
    async: true,
    inverse: 'users'
  }),
  primaryCohort: belongsTo('cohort', {async: true, inverse: null}),
  pendingUserUpdates: hasMany('pending-user-update', {async: true}),
  permissions: hasMany('permission', {async: true}),
  administeredCurriculumInventoryReports: hasMany('curriculum-inventory-report', {
    async: true,
    inverse: 'administrators'
  }),

  /**
   * Resolves to TRUE if this user has the "Student" role, otherwise FALSE.
   * @property isStudent
   * @type {Ember.computed}
   * @public
   */
  isStudent: computed('roles.[]', async function() {
    const roles = await this.get('roles');
    return !!roles.toArray().findBy('title', 'Student');
  }),

  /**
   * All schools that this user is associated with directly.
   * This includes the user's school affiliation, as well as any additional schools that
   * the user has read- and/or write-permissions to.
   * @property schools
   * @type {Ember.computed}
   * @public
   */
  schools: computed('school', async function(){
    const store = this.get('store');
    const primarySchool = await this.get('school');
    const permissions = await this.get('permissions');
    const schoolIds = permissions.toArray().filter(permission => {
      return 'school' === permission.get('tableName');
    }).mapBy('tableRowId');

    const schools = await all(schoolIds.map(id => {
      return store.findRecord('school', id);
    }));

    schools.pushObject(primarySchool);
    return schools.uniq();
  }),

  fullName: computed('firstName', 'middleName', 'lastName', function() {
    const { firstName, middleName, lastName } = this.getProperties('firstName', 'middleName', 'lastName');

    if (!firstName || !lastName) {
      return '';
    }

    const middleInitial = middleName?middleName.charAt(0):false;

    if (middleInitial) {
      return `${firstName} ${middleInitial}. ${lastName}`;
    } else {
      return `${firstName} ${lastName}`;
    }
  }),

  /**
   * A list of all courses that this user is instructing in.
   * @property allInstructedCourses
   * @type {Ember.computed}
   * @public
   */
  allInstructedCourses: computed(
    'instructedLearnerGroups.[]',
    'instructorGroups.[]',
    'instructedOfferings.[]',
    'instructorGroupCourses.[]',
    'instructorIlmSessions.[]',
    async function() {
      const instructedLearnerGroups = await this.get('instructedLearnerGroups');
      const instructorGroups = await this.get('instructorGroups');
      const instructedOfferings = await this.get('instructedOfferings');
      const instructorIlmSessions = await this.get('instructorIlmSessions');

      const groups = [];
      groups.pushObjects(instructedLearnerGroups.toArray());
      groups.pushObjects(instructorGroups.toArray());
      const listsOfCourses = await map(groups.mapBy('courses'), courses => {
        return courses.toArray();
      });

      // get a list of sessions associated with this user's offerings and ILMs
      const offeringsAndIlms = instructedOfferings.toArray();
      offeringsAndIlms.pushObjects(instructorIlmSessions.toArray());
      const sessions = await all(offeringsAndIlms.mapBy('session'));

      // get a list of courses from these sessions and add it to the lists of courses
      const listOfCourses = await all(sessions.uniq().mapBy('course'));
      listsOfCourses.pushObject(listOfCourses);

      // flatten these lists down to one list of courses, and de-dupe that list
      return listsOfCourses.reduce((array, set) => {
        array.pushObjects(set);
        return array;
      }, []).uniq();
    }
  ),

  /**
   * A list of all sessions that this user is instructing in.
   * @property allInstructedSessions
   * @type {Ember.computed}
   * @public
   */
  allInstructedSessions: computed(
    'instructorGroups.[]',
    'instructedOfferings.[]',
    'instructorGroupCourses.[]',
    'instructorIlmSessions.[]',
    async function() {
      const instructorGroups = await this.get('instructorGroups');
      const instructedOfferings = await this.get('instructedOfferings');
      const instructorIlmSessions = await this.get('instructorIlmSessions');

      const instructorGroupSessions = await all(instructorGroups.mapBy('sessions'), sessions => {
        return sessions.toArray();
      });

      // flatten these lists down to one list of sessions, and de-dupe that list
      const flatInstructorGroupSessions = instructorGroupSessions.reduce((array, set) => {
        array.pushObjects(set);
        return array;
      }, []).uniq();

      const sessions = await all([].concat(instructedOfferings.toArray(), instructorIlmSessions.toArray()).mapBy('session'));

      return A().concat(flatInstructorGroupSessions, sessions).uniq();
    }
  ),

  /**
   * A list of all courses that this user is associated with - be it as learner, instructor or director.
   * @property allRelatedCourses
   * @type {Ember.computed}
   * @public
   */
  allRelatedCourses: computed(
    'directedCourses.[]',
    'administeredCourses.[]',
    'learnerGroups.[]',
    'offerings.[]',
    'learnerIlmSessions.[]',
    'allInstructedCourses.[]',
    async function() {
      const directedCourses = await this.get('directedCourses');
      const administeredCourses = await this.get('administeredCourses');
      const learnerGroups = await this.get('learnerGroups');
      const offerings = await this.get('offerings');
      const learnerIlmSessions = await this.get('learnerIlmSessions');
      const allInstructedCourses = await this.get('allInstructedCourses');

      // get lists of courses associated with this user's learner-groups
      const listsOfCourses = await map(learnerGroups.mapBy('courses'), courses => {
        return courses.toArray();
      });

      // get a list of sessions associated with this user's offerings and ILMs
      const offeringsAndIlms = [];
      offeringsAndIlms.pushObjects(offerings.toArray());
      offeringsAndIlms.pushObjects(learnerIlmSessions.toArray());
      const sessions = await all(offeringsAndIlms.mapBy('session'));

      // get a list of courses from these sessions and add it to the lists of courses
      const listOfCourses = await all(sessions.uniq().mapBy('course'));
      listsOfCourses.pushObject(listOfCourses);

      // add the direct list of courses to the lists of courses
      listsOfCourses.pushObject(directedCourses.toArray());
      listsOfCourses.pushObject(administeredCourses.toArray());
      listsOfCourses.pushObject(allInstructedCourses.toArray());

      // flatten these lists down to one list of courses, and de-dupe that list
      return listsOfCourses.reduce((array, set) => {
        array.pushObjects(set);
        return array;
      }, []).uniq();
    }
  ),

  secondaryCohorts: computed('primaryCohort', 'cohorts.[]', async function(){
    const cohorts = await this.get('cohorts');
    const primaryCohort = await this.get('primaryCohort');
    return cohorts.toArray().filter(cohort => cohort !== primaryCohort);
  }),

  /**
   * Compare a user's learner groups to a list of learner groups and find the one
   * that is the lowest leaf in the learner group tree.
   * @property getLowestMemberGroupInALearnerGroupTree
   * @param {Array} learnerGroupTree all the groups we want to look into
   * @return {Object|null} The learner-group model or NULL if none could be found.
   * @type function
   * @public
   */
  async getLowestMemberGroupInALearnerGroupTree(learnerGroupTree){
    const learnerGroups = await this.get('learnerGroups');
    //all the groups a user is in that are in our current learner groups tree
    let relevantGroups = learnerGroups.toArray().filter(group => learnerGroupTree.includes(group));
    let relevantGroupIds = relevantGroups.mapBy('id');
    let lowestGroup = relevantGroups.find(group => {
      const childIds = group.hasMany('children').ids();
      const childGroupsWhoAreUserGroupMembers = childIds.filter(id => relevantGroupIds.includes(id));
      return (childGroupsWhoAreUserGroupMembers.length === 0);
    });
    return (lowestGroup ? lowestGroup : null);
  },
});
