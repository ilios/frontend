import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  title: DS.attr('string'),
  iliosAdministratorEmail: DS.attr('string'),
  isDeleted: DS.attr('boolean'),
  programs: DS.hasMany('program', {async: true}),
  stewardedProgramYears: DS.hasMany('program-year', {async: true}),
  instructorGroups: DS.hasMany('instructor-group', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  cohorts: function(){
    var school = this;
    return new Ember.RSVP.Promise(function(resolve) {
      school.get('programs').then(function(programs){
        var promises = programs.map(function(program){
          return program.get('programYears');
        });
        Ember.RSVP.hash(promises).then(function(hash){
          var promises = [];
          Object.keys(hash).forEach(function(key) {
            hash[key].forEach(function(programYear){
              promises.push(programYear.get('cohort'));
            });
          });
          Ember.RSVP.hash(promises).then(function(hash){
            var cohorts = Ember.A();
            Object.keys(hash).forEach(function(key) {
              cohorts.pushObject(hash[key]);
            });
            resolve(cohorts);
          });
        });
      });
    });
  }.property('programs.@each')
});
