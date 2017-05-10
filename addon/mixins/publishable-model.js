import Ember from 'ember';
import DS from 'ember-data';

const { computed } = Ember;
const { alias, oneWay, not } = computed;

export default Ember.Mixin.create({
  publishedAsTbd: DS.attr('boolean'),
  published: DS.attr('boolean'),
  isPublished: alias('published'),
  isNotPublished: not('isPublished'),
  isScheduled: oneWay('publishedAsTbd'),
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
