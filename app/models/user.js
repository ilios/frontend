import Ember from 'ember';
import DS from 'ember-data';

const { computed, PromiseProxyMixin, RSVP } = Ember;
const { PromiseArray } = DS;
const ProxyContent = Ember.Object.extend(PromiseProxyMixin);
const { Promise } = RSVP;

var User = DS.Model.extend({
  lastName: DS.attr('string'),
  firstName: DS.attr('string'),
  middleName: DS.attr('string'),
  phone: DS.attr('string'),
  email:  DS.attr('string'),
  addedViaIlios:  DS.attr('boolean'),
  enabled:  DS.attr('boolean'),
  campusId:  DS.attr('string'),
  otherId:  DS.attr('string'),
  examined:  DS.attr('boolean'),
  userSyncIgnore:  DS.attr('boolean'),
  icsFeedKey:  DS.attr('string'),
  reminders: DS.hasMany('user-made-reminder', {async: true}),
  reports: DS.hasMany('report', {async: true}),
  school: DS.belongsTo('school', {async: true}),
  authentication: DS.belongsTo('authentication', {async: true}),
  directedCourses: DS.hasMany('course', {
    async: true,
    inverse: 'directors'
  }),
  administeredCourses: DS.hasMany('course', {
    async: true,
    inverse: 'administrators'
  }),
  learnerGroups: DS.hasMany('learner-group', {
    async: true,
    inverse: 'users'
  }),
  instructedLearnerGroups: DS.hasMany('learner-group', {
    async: true,
    inverse: 'instructors'
  }),
  instructorGroups: DS.hasMany('instructor-group', {
    async: true,
    inverse: 'users'
  }),
  instructorIlmSessions: DS.hasMany('ilm-session', {
    async: true,
    inverse: 'instructors'
  }),
  learnerIlmSessions: DS.hasMany('ilm-session', {
    async: true,
    inverse: 'learners'
  }),
  offerings: DS.hasMany('offering', {
    async: true,
    inverse: 'learners'
  }),
  instructedOfferings: DS.hasMany('offering', {
    async: true,
    inverse: 'instructors'
  }),
  programYears: DS.hasMany('program-year', {async: true}),
  roles: DS.hasMany('user-role', {async: true}),
  directedSchools: DS.hasMany('school', {
    async: true,
    inverse: 'directors'
  }),

  isStudent: computed('roles', {
    get() {
      const isStudent = this.get('roles').then((roles) => {
        return !!roles.find((role) => role.get('title') === 'Student');
      });

      return ProxyContent.create({
        promise: isStudent
      });
    }
  }).readOnly(),

  cohorts: DS.hasMany('cohort', {
    async: true,
    inverse: 'users'
  }),
  primaryCohort: DS.belongsTo('cohort', {async: true}),
  pendingUserUpdates: DS.hasMany('pending-user-update', {async: true}),
  permissions: DS.hasMany('permission', {async: true}),
  schools: computed('school', function(){
    const store = this.get('store');
    var defer = RSVP.defer();
    this.get('school').then(primarySchool => {
      this.get('permissions').then(permissions => {
        let schoolIds = permissions.filter(permission => {
          return permission.get('tableName') === 'school';
        }).mapBy('tableRowId');
        let promises = schoolIds.map(id => {
          return store.findRecord('school', id);
        });
        RSVP.all(promises).then(schools => {
          schools.pushObject(primarySchool);
          defer.resolve(schools.uniq());
        });
      });
    });
    return PromiseArray.create({
      promise: defer.promise
    });
  }),

  fullName: computed('firstName', 'middleName', 'lastName', {
    get() {
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
    }
  }).readOnly(),

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
      let defer = RSVP.defer();
      let promises = [];
      let allCourses = [];
      promises.pushObject(new RSVP.Promise(resolve => {
        this.get('directedCourses').then(courses => {
          allCourses.pushObjects(courses.toArray());
          resolve();
        });
      }));
      promises.pushObject(new RSVP.Promise(resolve => {
        this.get('learnerGroups').then(groups => {
          RSVP.all(groups.mapBy('courses')).then(all => {
            all.forEach(arr => {
              allCourses.pushObjects(arr);
            });
            resolve();
          });
        });
      }));
      promises.pushObject(new RSVP.Promise(resolve => {
        this.get('instructorGroups').then(groups => {
          RSVP.all(groups.mapBy('courses')).then(all => {
            all.forEach(arr => {
              allCourses.pushObjects(arr);
            });
            resolve();
          });
        });
      }));
      promises.pushObject(new RSVP.Promise(resolve => {
        this.get('instructedOfferings').then(offerings => {
          RSVP.all(offerings.mapBy('session')).then(sessions => {
            RSVP.all(sessions.mapBy('course')).then(courses => {
              allCourses.pushObjects(courses);
              resolve();
            });
          });
        });
      }));
      promises.pushObject(new RSVP.Promise(resolve => {
        this.get('offerings').then(offerings => {
          RSVP.all(offerings.mapBy('session')).then(sessions => {
            RSVP.all(sessions.mapBy('course')).then(courses => {
              allCourses.pushObjects(courses);
              resolve();
            });
          });
        });
      }));
      promises.pushObject(new RSVP.Promise(resolve => {
        this.get('learnerIlmSessions').then(ilmSessions => {
          RSVP.all(ilmSessions.mapBy('session')).then(sessions => {
            RSVP.all(sessions.mapBy('course')).then(courses => {
              allCourses.pushObjects(courses);
              resolve();
            });
          });
        });
      }));
      promises.pushObject(new RSVP.Promise(resolve => {
        this.get('instructorIlmSessions').then(ilmSessions => {
          RSVP.all(ilmSessions.mapBy('session')).then(sessions => {
            RSVP.all(sessions.mapBy('course')).then(courses => {
              allCourses.pushObjects(courses);
              resolve();
            });
          });
        });
      }));
      RSVP.all(promises).then(()=>{
        defer.resolve(allCourses.uniq());
      });
      return PromiseArray.create({
        promise: defer.promise
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
   * @param array learnerGroupTree all the groups we want to look into
   * @type function
   * @public
   */
  getLowestMemberGroupInALearnerGroupTree(learnerGroupTree){
    const user = this;
    return new Promise(resolve => {
      user.get('learnerGroups').then(userGroups => {
        //all the groups a user is in that are in our current learner groups tree
        let relevantGroups = userGroups.filter(group => learnerGroupTree.contains(group));
        let relevantGroupIds = relevantGroups.mapBy('id');
        let lowestGroup = relevantGroups.find( group => {
          let childIds = group.hasMany('children').ids();
          let childGroupsWhoAreUserGroupMembers = childIds.filter(id => relevantGroupIds.contains(id));
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

export default User;
