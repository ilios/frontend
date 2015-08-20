import Ember from 'ember';
import DS from 'ember-data';

var User = DS.Model.extend({
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  middleName: DS.attr('string'),
  phone: DS.attr('string'),
  email:  DS.attr('string'),
  enabled:  DS.attr('boolean'),
  ucUid:  DS.attr('string'),
  otherId:  DS.attr('string'),
  offerings: DS.hasMany('offering', {
      async: true,
      inverse: 'users'
  }),
  learningMaterials: DS.hasMany('learning-material', {async: true}),
  publishEvents: DS.hasMany('publish-event', {async: true}),
  reports: DS.hasMany('report', {async: true}),
  directedCourses: DS.hasMany('course', {async: true}),
  learnerGroups: DS.hasMany('learner-group', {
      async: true,
      inverse: 'users'
    }
  ),
  instructorUserGroups: DS.hasMany('learner-group', {
      async: true,
      inverse: 'instructorUsers'
    }
  ),
  instructorGroups: DS.hasMany('instructor-group', {
      async: true,
      inverse: 'users'
    }
  ),
  instructedOfferings: DS.hasMany('offering', {
      async: true,
      inverse: 'instructors'
    }
  ),
  instructorIlmSessions: DS.hasMany('ilm-session', {async: true}),
  learnerIlmSessions: DS.hasMany('ilm-session', {async: true}),
  directedProgramYears: DS.hasMany('program-year', {async: true}),
  alerts: DS.hasMany('alert', {async: true}),
  roles: DS.hasMany('user-role', {async: true}),
  school: DS.belongsTo('school', {async: true}),
  cohorts: DS.hasMany('cohort', {async: true}),
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
  allRelatedCourses: Ember.computed.oneWay('directedCourses'),
});

export default User;
