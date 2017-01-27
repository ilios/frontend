import Ember from 'ember';
import DS from 'ember-data';
import PublishableModel from 'ilios/mixins/publishable-model';

const { computed, RSVP } = Ember;
const { all, defer, Promise} = RSVP;

export default DS.Model.extend(PublishableModel,{
  title: DS.attr('string'),
  shortTitle: DS.attr('string'),
  duration: DS.attr('number', { defaultValue: 1 }),
  school: DS.belongsTo('school', {async: true}),
  programYears: DS.hasMany('program-year', {
    async: true,
    inverse: 'program'
  }),
  directors: DS.hasMany('user', {
    async: true,
    inverse: 'directedPrograms'
  }),
  curriculumInventoryReports: DS.hasMany('curriculum-inventory-report', {async: true}),

  cohorts: computed('programYears.[]', function() {
    let deferred = defer();
    let allCohorts = [];
    let promises = [];
    promises.pushObject(new Promise(resolve => {
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
        all(promises).then(()=>{
          resolve();
        });
      });
    }));

    all(promises).then(()=>{
      deferred.resolve(allCohorts);
    });

    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }),

  courses: computed('cohorts.[]', function() {
    let deferred = defer();
    let allCourses = [];
    let promises = [];
    promises.pushObject(new Promise(resolve => {
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
        all(promises).then(()=>{
          resolve();
        });
      });
    }));

    all(promises).then(()=>{
      deferred.resolve(allCourses.uniq());
    });

    return DS.PromiseArray.create({
      promise: deferred.promise
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
