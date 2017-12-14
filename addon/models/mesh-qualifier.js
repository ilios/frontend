import DS from 'ember-data';

const { attr, hasMany, Model } = DS;

export default Model.extend({
  name: attr('string'),
  createdAt: attr('date'),
  updatedAt: attr('date'),
  descriptors: hasMany('mesh-descriptor', {async: true}),
});
