import DS from 'ember-data';

export default DS.Model.extend({
  report: DS.belongsTo('curriculum-inventory-report', {async: true}),
  sequenceBlocks: DS.hasMany('curriculum-inventory-sequence-block', {async: true}),
});
