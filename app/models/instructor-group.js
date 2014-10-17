import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  school: DS.belongsTo('school', {async: true}),
  users: DS.hasMany('user', {async: true}),
  offerings: DS.hasMany('offering', {async: true}),
  courses: [],
  coursesObserver: function(){
    var self = this;
    this.get('offerings').then(function(offerings){
      var courses = Ember.A();
      offerings.forEach(function(offering){
        offering.get('session').then(function(session){
          if(session !== null){
            session.get('course').then(function(course){
              if(courses.indexOf(course) === -1){
                courses.pushObject(course);
              }
              self.set('courses', courses);
            });
          }
        });
      });
    });
  }.observes('offerings.@each').on('init')
});
