import Ember from 'ember';
import DS from 'ember-data';

const { computed, PromiseProxyMixin, Object:EmberObject, RSVP } = Ember;
const { attr, belongsTo, hasMany, Model } = DS;
const { all, map, Promise } = RSVP;

const ProxyContent = EmberObject.extend(PromiseProxyMixin);

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

  isStudent: computed('roles', function() {
    const isStudent = this.get('roles').then((roles) => {
      return !!roles.find((role) => role.get('title') === 'Student');
    });

    return ProxyContent.create({
      promise: isStudent
    });
  }),

  cohorts: hasMany('cohort', {
    async: true,
    inverse: 'users'
  }),
  primaryCohort: belongsTo('cohort', {async: true}),
  pendingUserUpdates: hasMany('pending-user-update', {async: true}),
  permissions: hasMany('permission', {async: true}),
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
   * A list of all courses that this user is associated with - be it as learner, instructor or director.
   * @property allRelatedCourses
   * @type {Ember.computed}
   * @public
   */
  allRelatedCourses: computed(
    'directedCourses.[]',
    'learnerGroups.[]',
    'instructorGroups.[]',
    'instructedOfferings.[]',
    'offerings.[]',
    'instructorGroupCourses.[]',
    'learnerIlmSessions.[]',
    'instructorIlmSessions.[]',
    async function() {
      const directedCourses = await this.get('directedCourses');
      const learnerGroups = await this.get('learnerGroups');
      const instructorGroups = await this.get('instructorGroups');
      const instructedOfferings = await this.get('instructedOfferings');
      const offerings = await this.get('offerings');
      const learnerIlmSessions = await this.get('learnerIlmSessions');
      const instructorIlmSessions = await this.get('instructorIlmSessions');

      // get lists of courses associated with this user's learner- and instructor-groups
      const groups = [];
      groups.pushObjects(learnerGroups.toArray());
      groups.pushObjects(instructorGroups.toArray());
      const listsOfCourses = await map(groups.mapBy('courses'), courses => {
        return courses.toArray();
      });

      // get a list of sessions associated with this user's offerings and ILMs
      const offeringsAndIlms = instructedOfferings.toArray();
      offeringsAndIlms.pushObjects(offerings.toArray());
      offeringsAndIlms.pushObjects(learnerIlmSessions.toArray());
      offeringsAndIlms.pushObjects(instructorIlmSessions.toArray());
      const sessions = await all(offeringsAndIlms.mapBy('session'));

      // get a list of courses from these sessions and add it to the lists of courses
      const listOfCourses = await all(sessions.uniq().mapBy('course'));
      listsOfCourses.pushObject(listOfCourses);

      // add the list of directed courses to the lists of courses
      listsOfCourses.pushObject(directedCourses.toArray());

      // flatten these lists down to one list of courses, and de-dupe that list
      return listsOfCourses.reduce((array, set) => {
        array.pushObjects(set);
        return array;
      }, []).uniq();
    }
  ),

  absoluteIcsUri: computed('icsFeedKey', function(){
    return window.location.protocol + '//' + window.location.hostname + '/ics/' + this.get('icsFeedKey');
  }),
  /**
   * Compare a users learner groups to a list of learner groups and find the one
   * that is the lowest leaf in the learner group tree
   * @property summary
   * @param {Array} learnerGroupTree all the groups we want to look into
   * @type function
   * @public
   */
  getLowestMemberGroupInALearnerGroupTree(learnerGroupTree){
    const user = this;
    return new Promise(resolve => {
      user.get('learnerGroups').then(userGroups => {
        //all the groups a user is in that are in our current learner groups tree
        let relevantGroups = userGroups.filter(group => learnerGroupTree.includes(group));
        let relevantGroupIds = relevantGroups.mapBy('id');
        let lowestGroup = relevantGroups.find( group => {
          let childIds = group.hasMany('children').ids();
          let childGroupsWhoAreUserGroupMembers = childIds.filter(id => relevantGroupIds.includes(id));
          return childGroupsWhoAreUserGroupMembers.length === 0;
        });

        resolve(lowestGroup?lowestGroup:null);
      });

    });
  },
  secondaryCohorts: computed('primaryCohort', 'cohorts.[]', function(){
    return new Promise(resolve => {
      this.get('cohorts').then((cohorts) => {
        this.get('primaryCohort').then((primaryCohort) => {
          resolve(cohorts.filter(cohort => cohort !== primaryCohort));
        });
      });
    });
  })
});
