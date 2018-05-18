import { computed } from '@ember/object';
import DS from 'ember-data';

const { alias, equal } = computed;
const { attr, belongsTo, hasMany, Model } = DS;

export default Model.extend({
  title: attr('string'),
  description: attr('string'),
  required: attr('number'),
  childSequenceOrder: attr('number'),
  orderInSequence: attr('number'),
  minimum: attr('number'),
  maximum: attr('number'),
  track: attr('boolean'),
  startDate: attr('date'),
  endDate: attr('date'),
  duration: attr('number'),
  academicLevel: belongsTo('curriculum-inventory-academic-level', {async: true}),
  parent: belongsTo('curriculum-inventory-sequence-block', {async: true, inverse: 'children'}),
  children: hasMany('curriculum-inventory-sequence-block', {async: true, inverse: 'parent'}),
  report: belongsTo('curriculum-inventory-report', {async: true}),
  sessions: hasMany('session', {async: true}),
  excludedSessions: hasMany('session', {async: true}),
  course: belongsTo('course', {async: true}),

  isFinalized: alias('report.isFinalized'),
  isRequired: equal('required', 1),
  isOptional: equal('required', 2),
  isRequiredInTrack: equal('required', 3),
  isOrdered: equal('childSequenceOrder', 1),
  isUnordered: equal('childSequenceOrder', 2),
  isParallel: equal('childSequenceOrder', 3),

  /**
   * A list of all ancestors (parent, its parents parent etc) of this sequence block.
   * First element of the list is the block's direct ancestor (parent), while the last element is the oldest ancestor.
   *
   * Returns a promise that resolves to an array of sequence block objects.
   * If this sequence block is a top-level block within its owning report, then that array is empty.
   * @property allParents
   * @type {Ember.computed}
   * @public
   * @todo Rename this property to 'ancestors'. [ST 2016/11/01]
   */
  allParents: computed('parent', 'parent.allParents.[]', async function(){
    const rhett = [];
    const parent = await this.get('parent');
    if(!parent){
      return [];
    }
    rhett.pushObject(parent);
    const parentsAncestors = await parent.get('allParents');
    rhett.pushObjects(parentsAncestors);
    return rhett;
  }),
});
