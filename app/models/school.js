import DS from 'ember-data';
import Ember from 'ember';

const { computed } = Ember;

export default DS.Model.extend({
  title: DS.attr('string'),
  templatePrefix: DS.attr('string'),
  iliosAdministratorEmail: DS.attr('string'),
  changeAlertRecipients: DS.attr('string'),
  competencies: DS.hasMany('competencies', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  programs: DS.hasMany('program', {async: true}),
  departments: DS.hasMany('department', {async: true}),
  vocabularies: DS.hasMany('vocabulary', {async: true}),
  instructorGroups: DS.hasMany('instructor-group', {async: true}),
  curriculumInventoryInstitution: DS.belongsTo('curriculum-inventory-institution', {async: true}),
  sessionTypes: DS.hasMany('session-type', {async: true}),
  stewards: DS.hasMany('program-year-steward', {async: true}),
  cohorts: computed('programs.@each.programYears', {
    get(){
      return this.get('store').query('cohort', {
        filters: {
          schools: [this.get('id')]
        },
        limit: 1000
      });
    }
  }).readOnly(),
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
