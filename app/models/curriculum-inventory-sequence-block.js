import DS from 'ember-data';

export default DS.Model.extend({
  academicLevel: DS.belongsTo('curriculum-inventory-academic-level', {async: true}),
  parent: DS.belongsTo('curriculum-inventory-sequence-block', {async: true, inverse: 'children'}),
  children: DS.hasMany('curriculum-inventory-sequence-block', {async: true, inverse: 'parent'}),
  report: DS.belongsTo('curriculum-inventory-report', {async: true}),
  sessions: DS.hasMany('session', {async: true}),
});
