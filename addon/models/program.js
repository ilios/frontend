import Ember from 'ember';
import DS from 'ember-data';
import PublishableModel from 'ilios-common/mixins/publishable-model';

const { computed, RSVP } = Ember;
const { attr, belongsTo, hasMany, Model } = DS;
const { all, Promise} = RSVP;

export default Model.extend(PublishableModel,{
  title: attr('string'),
  shortTitle: attr('string'),
  duration: attr('number', { defaultValue: 1 }),
  school: belongsTo('school', {async: true}),
  programYears: hasMany('program-year', { async: true, inverse: 'program' }),
  directors: hasMany('user', { async: true, inverse: 'directedPrograms' }),
  curriculumInventoryReports: hasMany('curriculum-inventory-report', {async: true}),

  /**
   * All cohorts associated with this program via its program years.
   * @property cohorts
   * @type {Ember.computed}
   * @public
   */
  cohorts: computed('programYears.[]', function() {
    return new Promise(resolve => {
      let allCohorts = [];
      let promises = [];
      promises.pushObject(new Promise(resolve => {
        this.get('programYears').then(programYears => {
          if(!programYears.length){
            resolve();
          }
          let promises2 = [];
          programYears.forEach(programYear => {
            promises2.pushObject(programYear.get('cohort').then(cohort =>{
              allCohorts.pushObject(cohort);
            }));
          });
          all(promises2).then(()=>{
            resolve();
          });
        });
      }));

      all(promises).then(()=>{
        resolve(allCohorts);
      });
    });
  }),

  /**
   * All courses linked to this program via its program years/cohorts.
   * @property courses
   * @type {Ember.computed}
   * @public
   */
  courses: computed('cohorts.[]', function() {
    return new Promise(resolve => {
      let allCourses = [];
      let promises = [];
      promises.pushObject(new Promise(resolve => {
        this.get('cohorts').then(cohorts => {
          if(!cohorts.length){
            resolve();
          }
          let promises2 = [];
          cohorts.forEach(cohort => {
            promises2.pushObject(cohort.get('courses').then(courses =>{
              courses.forEach(course => {
                allCourses.pushObject(course);
              });
            }));
          });
          all(promises2).then(()=>{
            resolve();
          });
        });
      }));

      all(promises).then(()=>{
        resolve(allCourses.uniq());
      });
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
