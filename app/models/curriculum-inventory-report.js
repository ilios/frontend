import DS from 'ember-data';
export default DS.Model.extend({
  export: DS.belongsTo('curriculum-inventory-export', {async: true}),
  sequence: DS.belongsTo('curriculum-inventory-sequence', {async: true}),
  sequenceBlocks: DS.hasMany('curriculum-inventory-sequence-block', {async: true}),
  academicLevels: DS.hasMany('curriculum-inventory-academic-level', {async: true}),
  program: DS.belongsTo('program', {async: true}),
});
