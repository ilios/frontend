import DS from 'ember-data';

const { attr, belongsTo, hasMany, Model } = DS;

export default Model.extend({
  name: attr('string'),
  description: attr('string'),
  level: attr('number'),
  report: belongsTo('curriculum-inventory-report', {async: true}),
  sequenceBlocks: hasMany('curriculum-inventory-sequence-block', {async: true}),
});
