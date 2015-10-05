import DS from 'ember-data';
export default DS.Model.extend({
  name: DS.attr('string'),
  description: DS.attr('string'),
  year: DS.attr('string'),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  export: DS.belongsTo('curriculum-inventory-export', {async: true}),
  sequence: DS.belongsTo('curriculum-inventory-sequence', {async: true}),
  sequenceBlocks: DS.hasMany('curriculum-inventory-sequence-block', {async: true}),
  program: DS.belongsTo('program', {async: true}),
  academicLevels: DS.hasMany('curriculum-inventory-academic-level', {async: true}),
});
