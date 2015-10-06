import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  description: DS.attr('string'),
  required: DS.attr('integer'),
  childSequenceOrder: DS.attr('integer'),
  orderInSequence: DS.attr('integer'),
  minimum: DS.attr('integer'),
  maximum: DS.attr('integer'),
  track: DS.attr('boolean'),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  duration: DS.attr('integer'),
  academicLevel: DS.belongsTo('curriculum-inventory-academic-level', {async: true}),
  parent: DS.belongsTo('curriculum-inventory-sequence-block', {async: true, inverse: 'children'}),
  children: DS.hasMany('curriculum-inventory-sequence-block', {async: true, inverse: 'parent'}),
  report: DS.belongsTo('curriculum-inventory-report', {async: true}),
  sessions: DS.hasMany('curriculum-inventory-sequence-block-session', {async: true}),
});
