/* global moment */
import DS from 'ember-data';
import Ember from 'ember';
import PublishableModel from 'ilios/mixins/publishable-model';

var Session = DS.Model.extend(PublishableModel, {
  title: DS.attr('string'),
  attireRequired: DS.attr('boolean'),
  equipmentRequired: DS.attr('boolean'),
  supplemental: DS.attr('boolean'),
  deleted: DS.attr('boolean'),
  updatedAt: DS.attr('date'),
  course: DS.belongsTo('course', {async: true}),
  sessionType: DS.belongsTo('session-type', {async: true}),
  offerings: DS.hasMany('offering', {async: true}),
  disciplines: DS.hasMany('discipline', {async: true}),
  objectives: DS.hasMany('objective', {async: true}),
  meshDescriptors: DS.hasMany('mesh-descriptor', {async: true}),
  learningMaterials: DS.hasMany('session-learning-material', {async: true}),
  instructionHours: DS.hasMany('instruction-hour', {async: true}),
  sessionDescription: DS.belongsTo('session-description', {async: true}),
  ilmSessionFacet: DS.belongsTo('ilm-session', {async: true}),
  isIndependentLearning: Ember.computed.notEmpty('ilmSessionFacet.content'),
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
  searchString: function(){
    return this.get('title') + this.get('sessionType.title') + this.get('status');
  }.property('title', 'sessionType.title', 'status'),
  optionalPublicationLengthFields: ['disciplines', 'objectives', 'meshDescriptors'],
  requiredPublicationIssues: function(){
    if(!this.get('isIndependentLearning')){
      this.set('requiredPublicationLengthFields', ['offerings']);
      this.set('requiredPublicationSetFields', ['title']);
    } else {
      this.set('requiredPublicationLengthFields', []);
      this.set('requiredPublicationSetFields', ['title', 'ilmSessionFacet.dueDate']);
    }
    return this.getRequiredPublicationIssues();
  }.property(
    'title',
    'offerings.length',
    'ilmSessionFacet.isPublishable',
    'isIndependentLearning'
  ),
  optionalPublicationIssues: function(){
    return this.getOptionalPublicationIssues();
  }.property(
    'disciplines.length',
    'objectives.length',
    'meshDescriptors.length'
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
  }.property('offerings.@each.learnerGroups.@each'),
});

export default Session;
