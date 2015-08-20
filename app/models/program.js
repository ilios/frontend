import Ember from 'ember';
import DS from 'ember-data';
import PublishableModel from 'ilios/mixins/publishable-model';

export default DS.Model.extend(PublishableModel,{
  title: DS.attr('string'),
  shortTitle: DS.attr('string'),
  duration: DS.attr('number'),
  deleted: DS.attr('boolean'),
  school: DS.belongsTo('school', {async: true}),
  programYears: DS.hasMany('program-year', {
      async: true,
      inverse: 'program'
  }),
  cohortPromises: Ember.computed.mapBy('programYears', 'cohort'),
  cohorts: Ember.computed.mapBy('cohortPromises', 'content'),
  publishEvent: DS.belongsTo('publish-event', {async: true}),
  curriculumInventoryReports: DS.hasMany('curriculum-inventory-report', {async: true}),
  courseCounts: Ember.computed.mapBy('programYears', 'cohort.courses.length'),
  courseCount: Ember.computed.sum('courseCounts'),
  requiredPublicationSetFields: ['title', 'shortTitle', 'duration'],
  optionalPublicationLengthFields: ['programYears'],
  requiredPublicationIssues: function(){
    return this.getRequiredPublicationIssues();
  }.property(
    'title',
    'shortTitle',
    'duration'
  ),
  optionalPublicationIssues: function(){
    return this.getOptionalPublicationIssues();
  }.property(
    'programYears.length'
  ),
});
