/* global moment */
import DS from 'ember-data';
import Ember from 'ember';


var Session = DS.Model.extend({
    title: DS.attr('string'),
    attireRequired: DS.attr('boolean'),
    equipmentRequired: DS.attr('boolean'),
    supplemental: DS.attr('boolean'),
    deleted: DS.attr('boolean'),
    publishedAsTbd: DS.attr('boolean'),
    lastUpdatedOn: DS.attr('date'),
    course: DS.belongsTo('course', {async: true}),
    sessionType: DS.belongsTo('session-type', {async: true}),
    offerings: DS.hasMany('offering', {async: true}),
    publishEvent: DS.belongsTo('publish-event', {async: true}),
    directors: DS.hasMany('user', {async: true}),
    cohorts: DS.hasMany('cohort', {async: true}),
    disciplines: DS.hasMany('discipline', {async: true}),
    objectives: DS.hasMany('objective', {async: true}),
    meshDescriptors: DS.hasMany('mesh-descriptor', {async: true}),
    sessionLearningMaterials: DS.hasMany('session-learning-material', {async: true}),
    instructionHours: DS.hasMany('instruction-hour', {async: true}),
    sessionDescription: DS.belongsTo('session-description', {async: true}),
    ilmSessionFacet: DS.belongsTo('ilm-session', {async: true}),
    offeringLearnerGroupsLength: Ember.computed.mapBy('offerings', 'learnerGroups.length'),
    learnerGroupCount: Ember.computed.sum('offeringLearnerGroupsLength'),
    offeringsWithStartDate: Ember.computed.filterBy('offerings', 'startDate'),
    sortedOfferingsByDate: Ember.computed.sort('offeringsWithStartDate', function(a,b){
      var aDate = moment(a.get('startDate'));
      var bDate = moment(b.get('startDate'));
      if(aDate === bDate){
        return 0;
      }
      return aDate > bDate ? 1 : -1;
    }),
    firstOfferingDate: function(){
      var offerings = this.get('sortedOfferingsByDate');
      if(offerings.length === 0){
        return null;
      }
      return offerings.get('firstObject.startDate');
    }.property('sortedOfferingsByDate.@each'),
    isPublished: Ember.computed.notEmpty('publishEvent'),
    isNotPublished: Ember.computed.not('isPublished'),
    status: function(){
      if(this.get('publishEvent') != null){
        return Ember.I18n.t('general.published');
      } else {
        return Ember.I18n.t('general.notPublished');
      }
    }.property('publishEvent'),

});

export default Session;
