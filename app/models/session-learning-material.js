import DS from 'ember-data';

export default DS.Model.extend({
  session: DS.belongsTo('session', {async: true}),
  learningMaterial: DS.belongsTo('learning-material', {async: true}),
  meshDescriptors: DS.hasMany('mesh-descriptors', {async: true}),
});
