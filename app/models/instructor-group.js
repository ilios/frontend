import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  school: DS.belongsTo('school', {async: true}),
  users: DS.hasMany('user', {async: true}),
  offerings: DS.hasMany('offering', {async: true}),
  learnerGroups: DS.hasMany('learner-group', {async: true}),
  ilmSessions: DS.hasMany('ilm-session', {async: true}),
  deleted: DS.attr('boolean'),
  courses: function(){
    var defer = Ember.RSVP.defer();
    var group = this;
    group.get('offerings').then(function(offerings){
      var promises = offerings.map(function(offering){
        return offering.get('session').then(function(session){
          return session.get('course');
        });
      });
      Ember.RSVP.hash(promises).then(function(hash){
        var courses = Ember.A();
        Object.keys(hash).forEach(function(key) {
          var course = hash[key];
          if(!courses.contains(course)){
            courses.pushObject(course);
          }
        });
        defer.resolve(courses);
      });
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }.property('offerings.@each'),
});
