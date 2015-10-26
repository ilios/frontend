import Ember from 'ember';
import DS from 'ember-data';

const { computed, RSVP } = Ember;
const { PromiseArray } = DS;

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
  learningMaterials: DS.hasMany('learning-material', {async: true}),
  publishEvents: DS.hasMany('publish-event', {async: true}),
  reports: DS.hasMany('report', {async: true}),
  school: DS.belongsTo('school', {async: true}),
  directedCourses: DS.hasMany('course', {async: true}),
  learnerGroups: DS.hasMany('learner-group', {
      async: true,
      inverse: 'users'
    }
  ),
  instructedLearnerGroups: DS.hasMany('learner-group', {
      async: true,
      inverse: 'instructors'
    }
  ),
  instructorGroups: DS.hasMany('instructor-group', {
      async: true,
      inverse: 'users'
    }
  ),
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
    }
  ),
  programYears: DS.hasMany('program-year', {async: true}),
  alerts: DS.hasMany('alert', {async: true}),
  roles: DS.hasMany('user-role', {async: true}),
  cohorts: DS.hasMany('cohort', {
      async: true,
      inverse: 'users'
  }),
  primaryCohort: DS.belongsTo('cohort', {async: true}),
  pendingUserUpdates: DS.hasMany('pending-user-update', {async: true}),
  schools: computed('school', function(){
    var defer = RSVP.defer();
    this.get('school').then(function(school){
      defer.resolve([school]);
    });
    return defer.promise;
  }),
  fullName: computed('firstName', 'lastName', function() {
      var first = this.get('firstName');
      var last = this.get('lastName');
      if(!first || !last){
        return '';
      }
      return first + ' ' + last;
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
});

export default User;
