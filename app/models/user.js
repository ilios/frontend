import Ember from 'ember';
import DS from 'ember-data';

const { computed, PromiseProxyMixin, Object, RSVP } = Ember;
const { attr, belongsTo, hasMany, PromiseArray, Model } = DS;
const { all, defer, Promise } = RSVP;

const ProxyContent = Object.extend(PromiseProxyMixin);

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
  schools: computed('school', function(){
    const store = this.get('store');
    let deferred = defer();
    this.get('school').then(primarySchool => {
      this.get('permissions').then(permissions => {
        let schoolIds = permissions.filter(permission => {
          return permission.get('tableName') === 'school';
        }).mapBy('tableRowId');
        let promises = schoolIds.map(id => {
          return store.findRecord('school', id);
        });
        all(promises).then(schools => {
          schools.pushObject(primarySchool);
          deferred.resolve(schools.uniq());
        });
      });
    });
    return PromiseArray.create({
      promise: deferred.promise
    });
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

  allRelatedCourses: computed(
    'directedCourses.[]',
    'learnerGroups.[]',
    'instructorGroups.[]',
    'instructedOfferings.[]',
    'offerings.[]',
    'instructorGroupCourses.[]',
    'learnerIlmSessions.[]',
    'instructorIlmSessions.[]',
    function(){
      let deferred = defer();
      let promises = [];
      let allCourses = [];
      promises.pushObject(new Promise(resolve => {
        this.get('directedCourses').then(courses => {
          allCourses.pushObjects(courses.toArray());
          resolve();
        });
      }));
      promises.pushObject(new Promise(resolve => {
        this.get('learnerGroups').then(groups => {
          all(groups.mapBy('courses')).then(all => {
            all.forEach(arr => {
              allCourses.pushObjects(arr);
            });
            resolve();
          });
        });
      }));
      promises.pushObject(new Promise(resolve => {
        this.get('instructorGroups').then(groups => {
          all(groups.mapBy('courses')).then(all => {
            all.forEach(arr => {
              allCourses.pushObjects(arr);
            });
            resolve();
          });
        });
      }));
      promises.pushObject(new Promise(resolve => {
        this.get('instructedOfferings').then(offerings => {
          all(offerings.mapBy('session')).then(sessions => {
            all(sessions.mapBy('course')).then(courses => {
              allCourses.pushObjects(courses);
              resolve();
            });
          });
        });
      }));
      promises.pushObject(new Promise(resolve => {
        this.get('offerings').then(offerings => {
          all(offerings.mapBy('session')).then(sessions => {
            all(sessions.mapBy('course')).then(courses => {
              allCourses.pushObjects(courses);
              resolve();
            });
          });
        });
      }));
      promises.pushObject(new Promise(resolve => {
        this.get('learnerIlmSessions').then(ilmSessions => {
          all(ilmSessions.mapBy('session')).then(sessions => {
            all(sessions.mapBy('course')).then(courses => {
              allCourses.pushObjects(courses);
              resolve();
            });
          });
        });
      }));
      promises.pushObject(new Promise(resolve => {
        this.get('instructorIlmSessions').then(ilmSessions => {
          all(ilmSessions.mapBy('session')).then(sessions => {
            all(sessions.mapBy('course')).then(courses => {
              allCourses.pushObjects(courses);
              resolve();
            });
          });
        });
      }));
      all(promises).then(()=>{
        deferred.resolve(allCourses.uniq());
      });
      return PromiseArray.create({
        promise: deferred.promise
      });
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
