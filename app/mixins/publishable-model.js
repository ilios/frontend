import Ember from 'ember';
import DS from 'ember-data';

const { computed } = Ember;

export default Ember.Mixin.create({
  i18n: Ember.inject.service(),
  publishedAsTbd: DS.attr('boolean'),
  publishEvent: DS.belongsTo('publish-event', {async: true}),
  isPublished: computed.notEmpty('publishEvent.content'),
  isNotPublished: computed.not('isPublished'),
  isScheduled: computed.oneWay('publishedAsTbd'),
  status: computed('i18n.locale', 'isPublished', 'publishedAsTbd', function(){
    if(this.get('publishedAsTbd')){
      return this.get('i18n').t('general.scheduled');
    }
    if(this.get('isPublished')){
      return this.get('i18n').t('general.published');
    }
    return this.get('i18n').t('general.notPublished');
  }),
  isPublishedOrScheduled: computed('publishTarget.isPublished', 'publishTarget.isScheduled', function(){
    return this.get('publishedAsTbd') || this.get('isPublished');
  }),
  allPublicationIssuesCollection: computed.collect('requiredPublicationIssues.length', 'optionalPublicationIssues.length'),
  allPublicationIssuesLength: computed.sum('allPublicationIssuesCollection'),
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
