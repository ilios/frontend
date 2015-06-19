import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Mixin.create({
  publishedAsTbd: DS.attr('boolean'),
  publishEvent: DS.belongsTo('publish-event', {async: true}),
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
  requiredPublicationSetFields: [],
  requiredPublicationLengthFields: [],
  optionalPublicationSetFields: [],
  optionalPublicationLengthFields: [],
  getRequiredPublicationIssues(){
    var issues = [];
    this.get('requiredPublicationSetFields').forEach(val => {
      if(!this.get(val)){
        issues.push(val);
      }
    });

    this.get('requiredPublicationLengthFields').forEach(val => {
      if(this.get(val + '.length') === 0){
        issues.push(val);
      }
    });

    return issues;
  },
  getOptionalPublicationIssues(){
    var issues = [];
    this.get('optionalPublicationSetFields').forEach(val => {
      if(!this.get(val)){
        issues.push(val);
      }
    });

    this.get('optionalPublicationLengthFields').forEach(val => {
      if(this.get(val + '.length') === 0){
        issues.push(val);
      }
    });

    return issues;
  },
});
