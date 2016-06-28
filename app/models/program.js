import Ember from 'ember';
import DS from 'ember-data';
import PublishableModel from 'ilios/mixins/publishable-model';

const { computed } = Ember;

export default DS.Model.extend(PublishableModel,{
  title: DS.attr('string'),
  shortTitle: DS.attr('string'),
  duration: DS.attr('number', { defaultValue: 1 }),
  school: DS.belongsTo('school', {async: true}),
  programYears: DS.hasMany('program-year', {
    async: true,
    inverse: 'program'
  }),
  curriculumInventoryReports: DS.hasMany('curriculum-inventory-report', {async: true}),

  cohorts: computed('programYears.[]', function() {
    let defer = Ember.RSVP.defer();
    let allCohorts = [];
    let promises = [];
    promises.pushObject(new Ember.RSVP.Promise(resolve => {
      this.get('programYears').then(programYears => {
        if(!programYears.length){
          resolve();
        }
        let promises = [];
        programYears.forEach(programYear => {
          promises.pushObject(programYear.get('cohort').then(cohort =>{
            allCohorts.pushObject(cohort);
          }));
        });
        Ember.RSVP.all(promises).then(()=>{
          resolve();
        });
      });
    }));

    Ember.RSVP.all(promises).then(()=>{
      defer.resolve(allCohorts);
    });

    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),

  courses: computed('cohorts.[]', function() {
    let defer = Ember.RSVP.defer();
    let allCourses = [];
    let promises = [];
    promises.pushObject(new Ember.RSVP.Promise(resolve => {
      this.get('cohorts').then(cohorts => {
        if(!cohorts.length){
          resolve();
        }
        let promises = [];
        cohorts.forEach(cohort => {
          promises.pushObject(cohort.get('courses').then(courses =>{
            courses.forEach(course => {
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
  }),
  requiredPublicationSetFields: ['title', 'shortTitle', 'duration'],
  optionalPublicationLengthFields: ['programYears'],
  requiredPublicationIssues: computed('title', 'shortTitle', 'duration', function(){
    return this.getRequiredPublicationIssues();
  }),
  optionalPublicationIssues: computed('programYears.length', function(){
    return this.getOptionalPublicationIssues();
  }),
});
