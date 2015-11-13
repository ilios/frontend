import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  title: DS.attr('string'),
  templatePrefix: DS.attr('string'),
  iliosAdministratorEmail: DS.attr('string'),
  changeAlertRecipients: DS.attr('string'),
  competencies: DS.hasMany('competencies', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  programs: DS.hasMany('program', {async: true}),
  departments: DS.hasMany('department', {async: true}),
  topics: DS.hasMany('topic', {async: true}),
  instructorGroups: DS.hasMany('instructor-group', {async: true}),
  curriculumInventoryInsitution: DS.belongsTo('curriculum-inventory-institution', {async: true}),
  sessionTypes: DS.hasMany('session-type', {async: true}),
  stewards: DS.hasMany('program-year-steward', {async: true}),
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
  }.property('programs.@each'),
  getCohortsForYear(year){
    let defer = Ember.RSVP.defer();
    this.getProgramYearsForYear(year).then(programYears => {
      let cohorts = [];
      let promises = [];
      programYears.forEach(programYear => {
        promises.pushObject(programYear.get('cohort').then(cohort => {
          cohorts.pushObject(cohort);
        }));
      });
      Ember.RSVP.all(promises).then(()=> {
        defer.resolve(cohorts);
      });
    });
    
    
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  },
  getProgramYearsForYear(year){
    let defer = Ember.RSVP.defer();
    this.get('programs').then(programs => {
      let promises = [];
      let filteredProgramYears = [];
      programs.forEach(program => {
        promises.pushObject(program.get('programYears').then(programYears => {
          programYears.forEach(programYear => {
            if(parseInt(programYear.get('startYear')) === year){
              filteredProgramYears.pushObject(programYear);
            }
          });
        }));
        Ember.RSVP.all(promises).then(()=> {
          defer.resolve(filteredProgramYears);
        });
      });
    });

    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }
});
