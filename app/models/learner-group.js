import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  title: DS.attr('string'),
  location: DS.attr('string'),
  cohort: DS.belongsTo('cohort', {async: true}),
  parent: DS.belongsTo('learner-group', {async: true, inverse: 'children'}),
  children: DS.hasMany('learner-group', {async: true, inverse: 'parent'}),
  users: DS.hasMany('user', {async: true}),
  instructors: DS.hasMany('user', {async: true}),
  instructorGroups: DS.hasMany('instructor-group', {async: true}),
  offerings: DS.hasMany('offering', {async: true}),
  courses: function(){
    var group = this;
    return new Ember.RSVP.Promise(function(resolve) {
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
          resolve(courses);
        });
      });
    });
  }.property('offerings.@each'),
  availableUsers: function(){
    var group = this;
    return this.get('parent').then(function(parent){
      if(parent == null){
        return group.store.find('user');
      } else {
        return parent.get('users');
      }
    });
  }.property('users','parent.users.@each')
});
