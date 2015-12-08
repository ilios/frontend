import moment from 'moment';
import DS from 'ember-data';
import Ember from 'ember';
import PublishableModel from 'ilios/mixins/publishable-model';

const { computed } = Ember;
const { filterBy, mapBy, notEmpty, sort, sum } = computed;

var Session = DS.Model.extend(PublishableModel, {
  title: DS.attr('string'),
  attireRequired: DS.attr('boolean'),
  equipmentRequired: DS.attr('boolean'),
  supplemental: DS.attr('boolean'),
  updatedAt: DS.attr('date'),
  sessionType: DS.belongsTo('session-type', {async: true}),
  course: DS.belongsTo('course', {async: true}),
  ilmSession: DS.belongsTo('ilm-session', {async: true}),
  topics: DS.hasMany('topic', {async: true}),
  objectives: DS.hasMany('objective', {async: true}),
  meshDescriptors: DS.hasMany('mesh-descriptor', {async: true}),
  sessionDescription: DS.belongsTo('session-description', {async: true}),
  learningMaterials: DS.hasMany('session-learning-material', {async: true}),
  offerings: DS.hasMany('offering', {async: true}),
  isIndependentLearning: notEmpty('ilmSession.content'),
  offeringLearnerGroupsLength: mapBy('offerings', 'learnerGroups.length'),
  learnerGroupCount: sum('offeringLearnerGroupsLength'),
  offeringsWithStartDate: filterBy('offerings', 'startDate'),
  sortedOfferingsByDate: sort('offeringsWithStartDate', function(a,b){
    var aDate = moment(a.get('startDate'));
    var bDate = moment(b.get('startDate'));
    if(aDate === bDate){
      return 0;
    }
    return aDate > bDate ? 1 : -1;
  }),
  firstOfferingDate: computed('sortedOfferingsByDate.[]', 'ilmSession.dueDate', function(){
    var self = this;
    var deferred = Ember.RSVP.defer();
    this.get('ilmSession').then(function(ilmSession){
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
  }),
  searchString: computed('title', 'sessionType.title', 'status', function(){
    return this.get('title') + this.get('sessionType.title') + this.get('status');
  }),
  optionalPublicationLengthFields: ['topics', 'objectives', 'meshDescriptors'],
  requiredPublicationIssues: computed(
    'title',
    'offerings.length',
    'ilmSession.isPublishable',
    'isIndependentLearning',
    function(){
      if(!this.get('isIndependentLearning')){
        this.set('requiredPublicationLengthFields', ['offerings']);
        this.set('requiredPublicationSetFields', ['title']);
      } else {
        this.set('requiredPublicationLengthFields', []);
        this.set('requiredPublicationSetFields', ['title', 'ilmSession.dueDate']);
      }
      return this.getRequiredPublicationIssues();
    }
  ),
  optionalPublicationIssues: computed(
    'topics.length',
    'objectives.length',
    'meshDescriptors.length',
    function(){
      return this.getOptionalPublicationIssues();
    }
  ),
  associatedLearnerGroups: computed('offerings.@each.learnerGroups.[]', function(){
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
  }),
});

export default Session;
