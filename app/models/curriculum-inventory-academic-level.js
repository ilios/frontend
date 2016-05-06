import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  description: DS.attr('string'),
  level: DS.attr('number'),
  report: DS.belongsTo('curriculum-inventory-report', {async: true}),
  sequenceBlocks: DS.hasMany('curriculum-inventory-sequence-block', {async: true}),
});
