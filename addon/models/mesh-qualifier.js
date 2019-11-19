import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  name: attr('string'),
  createdAt: attr('date'),
  updatedAt: attr('date'),
  descriptors: hasMany('mesh-descriptor', {async: true}),
});
