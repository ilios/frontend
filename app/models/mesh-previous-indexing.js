import DS from 'ember-data';

export default DS.Model.extend({
  previousIndexing: DS.attr('string'),
  descriptor: DS.belongsTo('mesh-descriptor', {async: true}),
});
