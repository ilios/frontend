import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  title: DS.attr('string'),
  shortTitle: DS.attr('string'),
  duration: DS.attr('number'),
  deleted: DS.attr('boolean'),
  publishedAsTbd: DS.attr('boolean'),
  owningSchool: DS.belongsTo('school', {async: true}),
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
  isPublished: Ember.computed.notEmpty('publishEvent.content'),
  isNotPublished: Ember.computed.not('isPublished'),
  isScheduled: Ember.computed.oneWay('publishedAsTbd'),
  status: function(){
    if(this.get('publishedAsTbd')){
      return Ember.I18n.t('general.scheduled');
    }
    if(this.get('isPublished')){
      return Ember.I18n.t('general.published');
    }
    return Ember.I18n.t('general.notPublished');
  }.property('isPublished', 'publishedAsTbd'),
  allPublicationIssuesCollection: Ember.computed.collect('requiredPublicationIssues.length', 'optionalPublicationIssues.length'),
  allPublicationIssuesLength: Ember.computed.sum('allPublicationIssuesCollection'),
  requiredPublicationIssues: function(){
    var self = this;
    var issues = [];
    var requiredSet = [
      'title',
      'shortTitle',
      'duration'
    ];
    requiredSet.forEach(function(val){
      if(!self.get(val)){
        issues.push(val);
      }
    });

    return issues;
  }.property(
    'title',
    'shortTitle',
    'duration'
  ),
  optionalPublicationIssues: function(){
    var self = this;
    var issues = [];
    var requiredLength = [
      'programYears',
    ];

    requiredLength.forEach(function(val){
      if(self.get(val + '.length') === 0){
        issues.push(val);
      }
    });

    return issues;
  }.property(
    'programYears.length'
  ),
});
