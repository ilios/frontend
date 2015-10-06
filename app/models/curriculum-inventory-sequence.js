import DS from 'ember-data';

export default DS.Model.extend({
  description: DS.attr('string'),
  report: DS.belongsTo('curriculum-inventory-report', {async: true}),  
});
