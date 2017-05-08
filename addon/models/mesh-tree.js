import DS from 'ember-data';

export default DS.Model.extend({
  treeNumber: DS.attr('string'),
  descriptor: DS.belongsTo('mesh-descriptor', {async: true}),
});
