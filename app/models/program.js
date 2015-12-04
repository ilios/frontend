import Ember from 'ember';
import DS from 'ember-data';
import PublishableModel from 'ilios/mixins/publishable-model';

const { computed } = Ember;
const { mapBy, sum } = computed;

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
  cohortPromises: mapBy('programYears', 'cohort'),
  cohorts: mapBy('cohortPromises', 'content'),
  courseCounts: mapBy('programYears', 'cohort.courses.length'),
  courseCount: sum('courseCounts'),
  requiredPublicationSetFields: ['title', 'shortTitle', 'duration'],
  optionalPublicationLengthFields: ['programYears'],
  requiredPublicationIssues: computed('title', 'shortTitle', 'duration', function(){
    return this.getRequiredPublicationIssues();
  }),
  optionalPublicationIssues: computed('programYears.length', function(){
    return this.getOptionalPublicationIssues();
  }),
});
