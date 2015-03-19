import DS from 'ember-data';

export default DS.Model.extend({
  required: DS.attr('boolean'),
  publicNotes: DS.attr('boolean'),
  session: DS.belongsTo('session', {async: true}),
  learningMaterial: DS.belongsTo('learning-material', {async: true}),
  meshDescriptors: DS.hasMany('mesh-descriptors', {async: true}),
});
