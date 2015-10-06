import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  umlsUid: DS.attr('string'),
  preferred: DS.attr('boolean'),
  scope: DS.attr('string'),
  cash1Name: DS.attr('string'),
  registryNumber: DS.attr('string'),
  symanticTypes: DS.hasMany('mesh-semantic-type',  {async: true}),
  terms: DS.hasMany('mesh-term',  {async: true}),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),
  descriptors: DS.hasMany('mesh-descriptor',  {async: true}),
});
