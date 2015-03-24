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
  updatedAt: DS.attr('date'),
  course: DS.belongsTo('course', {async: true}),
  sessionType: DS.belongsTo('session-type', {async: true}),
  offerings: DS.hasMany('offering', {async: true}),
  publishEvent: DS.belongsTo('publish-event', {async: true}),
  disciplines: DS.hasMany('discipline', {async: true}),
  objectives: DS.hasMany('objective', {async: true}),
  meshDescriptors: DS.hasMany('mesh-descriptor', {async: true}),
  learningMaterials: DS.hasMany('session-learning-material', {async: true}),
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
    var self = this;
    var deferred = Ember.RSVP.defer();
    this.get('ilmSessionFacet').then(function(ilmSession){
      if(ilmSession){
        deferred.resolve(ilmSession.get('dueDate'));
      } else {
        var offerings = self.get('sortedOfferingsByDate');
        if(offerings.length === 0){
          deferred.resolve(null);
        }
        deferred.resolve(offerings.get('firstObject.startDate'));
      }
    });
    return DS.PromiseObject.create({
      promise: deferred.promise
    });
  }.property('sortedOfferingsByDate.@each', 'ilmSessionFacet.dueDate'),
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
  searchString: function(){
    return this.get('title') + this.get('sessionType.title') + this.get('status');
  }.property('title', 'sessionType.title', 'status'),
  allPublicationIssuesCollection: Ember.computed.collect('requiredPublicationIssues.length', 'optionalPublicationIssues.length'),
  allPublicationIssuesLength: Ember.computed.sum('allPublicationIssuesCollection'),
  requiredPublicationIssues: function(){
    var self = this;
    var issues = [];
    var requiredSet = [
      'title'
    ];
    var requiredLength = [];
    if(!this.get('isIndependentLearning')){
      requiredLength.pushObject('offerings');
    }
    requiredSet.forEach(function(val){
      if(!self.get(val)){
        issues.push(val);
      }
    });

    requiredLength.forEach(function(val){
      if(self.get(val + '.length') === 0){
        issues.push(val);
      }
    });

    return issues;
  }.property(
    'title',
    'offerings.length',
    'isIndependentLearning'
  ),
  optionalPublicationIssues: function(){
    var self = this;
    var issues = [];
    var requiredLength = [
      'disciplines',
      'objectives',
      'meshDescriptors',
    ];

    requiredLength.forEach(function(val){
      if(self.get(val + '.length') === 0){
        issues.push(val);
      }
    });

    return issues;
  }.property(
    'topics.length',
    'objectives.length',
    'meshDescriptors.length',
    'offerings.length',
    'isIndependentLearning'
  ),
  associatedLearnerGroups: function(){
    var deferred = Ember.RSVP.defer();
    this.get('offerings').then(function(offerings){
      Ember.RSVP.all(offerings.mapBy('learnerGroups')).then(function(offeringLearnerGroups){
        var allGroups = [];
        offeringLearnerGroups.forEach(function(learnerGroups){
          learnerGroups.forEach(function(group){
            allGroups.pushObject(group);
          });
        });
        var groups = allGroups?allGroups.uniq().sortBy('title'):[];
        deferred.resolve(groups);
      });
    });

    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }.property('offerings.[].learnerGroups.[]'),
  isIndependentLearning: Ember.computed.notEmpty('ilmSessionFacet.content'),
});

export default Session;
