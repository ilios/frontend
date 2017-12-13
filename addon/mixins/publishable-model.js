import { collect, sum } from '@ember/object/computed';
import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import DS from 'ember-data';

const { alias, oneWay, not } = computed;

export default Mixin.create({
  publishedAsTbd: DS.attr('boolean'),
  published: DS.attr('boolean'),
  isPublished: alias('published'),
  isNotPublished: not('isPublished'),
  isScheduled: oneWay('publishedAsTbd'),
  isPublishedOrScheduled: computed('publishTarget.isPublished', 'publishTarget.isScheduled', function(){
    return this.get('publishedAsTbd') || this.get('isPublished');
  }),
  allPublicationIssuesCollection: collect('requiredPublicationIssues.length', 'optionalPublicationIssues.length'),
  allPublicationIssuesLength: sum('allPublicationIssuesCollection'),
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
