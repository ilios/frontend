import Ember from 'ember';
import DS from 'ember-data';

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
  instructorIlmSessions: DS.hasMany('ilm-session', {async: true}),
  learnerIlmSessions: DS.hasMany('ilm-session', {async: true}),
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
  schools: function(){
    var defer = Ember.RSVP.defer();
    this.get('school').then(function(school){
      defer.resolve([school]);
    });
    return defer.promise;
  }.property('school'),
  fullName: function() {
      var first = this.get('firstName');
      var last = this.get('lastName');
      if(!first || !last){
        return '';
      }
      return first + ' ' + last;
  }.property('firstName', 'lastName'),
  events: [],
  allRelatedCourses: Ember.computed(
    'directedCourses.[]',
    'learnerGroups.[].courses.[]',
    'instructorGroups.[].courses.[]',
    'instructedOfferings.[].session.course',
    function(){
      let defer = Ember.RSVP.defer();
      let promises = [];
      let allCourses = [];
      promises.pushObject(new Ember.RSVP.Promise(resolve => {
         this.get('directedCourses').then(courses => {
           allCourses.pushObjects(courses.toArray());
           resolve();
         });
       }));
       promises.pushObject(new Ember.RSVP.Promise(resolve => {
         this.get('learnerGroups').then(learnerGroups => {
           if(!learnerGroups.length){
             resolve();
           }
           let promises = [];
           learnerGroups.forEach(learnerGroup => {
             promises.pushObject(learnerGroup.get('courses').then(courses =>{
               allCourses.pushObjects(courses.toArray());
             }));
             Ember.RSVP.all(promises).then(()=>{
               resolve();
             });
           });
         });
       }));
       promises.pushObject(new Ember.RSVP.Promise(resolve => {
         this.get('instructorGroups').then(instructorGroups => {
           if(!instructorGroups.length){
             resolve();
           }
           let promises = [];
           instructorGroups.forEach(instructorGroup => {
             promises.pushObject(instructorGroup.get('courses').then(courses =>{
               allCourses.pushObjects(courses.toArray());
             }));
             Ember.RSVP.all(promises).then(()=>{
               resolve();
             });
           });
         });
       }));
       promises.pushObject(new Ember.RSVP.Promise(resolve => {
         this.get('instructedOfferings').then(offerings => {
           if(!offerings.length){
             resolve();
           }
           let promises = [];
           offerings.forEach(offering => {
             promises.pushObject(offering.get('session').then(session =>{
               return session.get('course').then(course => {
                 allCourses.pushObject(course);
               });
             }));
           });
           Ember.RSVP.all(promises).then(()=>{
             resolve();
           });
         });
       }));
       promises.pushObject(new Ember.RSVP.Promise(resolve => {
         this.get('offerings').then(offerings => {
           if(!offerings.length){
             resolve();
           }
           let promises = [];
           offerings.forEach(offering => {
             promises.pushObject(offering.get('session').then(session =>{
               return session.get('course').then(course => {
                 allCourses.pushObject(course);
               });
             }));
           });
           Ember.RSVP.all(promises).then(()=>{
             resolve();
           });
         });
       }));
       promises.pushObject(new Ember.RSVP.Promise(resolve => {
         this.get('learnerIlmSessions').then(ilmSessions => {
           if(!ilmSessions.length){
             resolve();
           }
           let promises = [];
           ilmSessions.forEach(ilmSession => {
             promises.pushObject(ilmSession.get('session').then(session =>{
               if(!session){
                 return;
               }
               return session.get('course').then(course => {
                 allCourses.pushObject(course);
               });
             }));
           });
           Ember.RSVP.all(promises).then(()=>{
             resolve();
           });
         });
       }));
       promises.pushObject(new Ember.RSVP.Promise(resolve => {
         this.get('instructorIlmSessions').then(ilmSessions => {
           if(!ilmSessions.length){
             resolve();
           }
           let promises = [];
           ilmSessions.forEach(ilmSession => {
             promises.pushObject(ilmSession.get('session').then(session =>{
               if(!session){
                 return;
               }
               return session.get('course').then(course => {
                 allCourses.pushObject(course);
               });
             }));
           });
           Ember.RSVP.all(promises).then(()=>{
             resolve();
           });
         });
       }));
      
      Ember.RSVP.all(promises).then(()=>{
        defer.resolve(allCourses.uniq());
      });
      return DS.PromiseArray.create({
        promise: defer.promise
      });
    }
  ),
});

export default User;
