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
  offerings: DS.hasMany('offering', {async: true}),
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
  instructorIlmSessions: DS.hasMany('ilm-session', {async: true}),
  learnerIlmSessions: DS.hasMany('ilm-session', {async: true}),
  programYears: DS.hasMany('program-year', {async: true}),
  instructionHours: DS.hasMany('instruction-hours', {async: true}),
  alerts: DS.hasMany('alert', {async: true}),
  roles: DS.hasMany('user-role', {async: true}),
  primarySchool: DS.belongsTo('school', {async: true}),
  schools: function(){
    var defer = Ember.RSVP.defer();
    this.get('primarySchool').then(function(school){
      defer.resolve([school]);
    });
    return defer.promise;
  }.property('primarySchool'),
  fullName: function() {
      return this.get('firstName') + ' ' + this.get('lastName');
  }.property('firstName', 'lastName'),
  events: function(){
      var promises = {
        offerings: this.get('offerings')
      };
      return new Ember.RSVP.hash(promises).then(function(results) {
        var events = [];
        results.offerings.forEach(function(offering){
            events.push(offering);
        });

        var eventPromises = [];
        events.forEach(function(event){
           eventPromises.push(event.get('start'));
           eventPromises.push(event.get('end'));
           eventPromises.push(event.get('title'));
        });
        return new Ember.RSVP.all(eventPromises).then(function(){
            return events;
        });
      });
  }.property('offerings.@each', 'offerings.@each.session'),
  allRelatedCourses: Ember.computed.alias('directedCourses'),
});

export default User;
