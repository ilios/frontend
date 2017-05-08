import DS from 'ember-data';
export default DS.Model.extend({
  createdAt: DS.attr('date'),
  report: DS.belongsTo('curriculum-inventory-report', {async: true}),
  createdBy: DS.belongsTo('user', {async: true}),
});
