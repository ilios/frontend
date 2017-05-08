import DS from 'ember-data';

const { attr, belongsTo, hasMany, Model } = DS;

export default Model.extend({
  notes: attr('string'),
  required: attr('boolean', { defaultValue: true }),
  publicNotes: attr('boolean', { defaultValue: true }),
  course: belongsTo('course', { async: true }),
  learningMaterial: belongsTo('learning-material', { async: true }),
  meshDescriptors: hasMany('mesh-descriptors', { async: true }),
  position: attr('number', { defaultValue: 0 })
});
