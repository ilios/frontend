import Ember from 'ember';
import DS from 'ember-data';

const { RSVP, computed }  = Ember;
const { alias, equal } = computed;
const { Promise } = RSVP;

export default DS.Model.extend({
  title: DS.attr('string'),
  description: DS.attr('string'),
  required: DS.attr('number'),
  childSequenceOrder: DS.attr('number'),
  orderInSequence: DS.attr('number'),
  minimum: DS.attr('number'),
  maximum: DS.attr('number'),
  track: DS.attr('boolean'),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  duration: DS.attr('number'),
  academicLevel: DS.belongsTo('curriculum-inventory-academic-level', {async: true}),
  parent: DS.belongsTo('curriculum-inventory-sequence-block', {async: true, inverse: 'children'}),
  children: DS.hasMany('curriculum-inventory-sequence-block', {async: true, inverse: 'parent'}),
  report: DS.belongsTo('curriculum-inventory-report', {async: true}),
  sessions: DS.hasMany('session', {async: true}),
  course: DS.belongsTo('course', {async: true}),

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
  allParents: computed('parent', 'parent.allParents.[]', function(){
    return new Promise(resolve => {
      this.get('parent').then(parent => {
        let parents = [];
        if(!parent){
          resolve(parents);
        } else {
          parents.pushObject(parent);
          parent.get('allParents').then(allParents => {
            parents.pushObjects(allParents);
            resolve(parents);
          });
        }
      });
    });
  }),
});
