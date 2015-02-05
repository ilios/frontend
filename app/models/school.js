import DS from 'ember-data';
import Ember from 'ember';
export default DS.Model.extend({
  title: DS.attr('string'),
  iliosAdministratorEmail: DS.attr('string'),
  deleted: DS.attr('boolean'),
  changeAlertRecipients: DS.attr('string'),
  programs: DS.hasMany('program', {async: true}),
  alerts: DS.hasMany('alert', {async: true}),
  competencies: DS.hasMany('competencies', {async: true}),
  departments: DS.hasMany('department', {async: true}),
  disciplines: DS.hasMany('discipline', {async: true}),
  curriculumInventoryInsitution: DS.belongsTo('curriculum-inventory-institution', {async: true}),
  sessionTypes: DS.hasMany('session-type', {async: true}),
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
              if(hash[key] != null){
                cohorts.pushObject(hash[key]);
              }
            });
            resolve(cohorts);
          });
        });
      });
    });
  }.property('programs.@each')
});
