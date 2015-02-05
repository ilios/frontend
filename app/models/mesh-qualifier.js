import DS from 'ember-data';

export default DS.Model.extend({
  descriptors: DS.hasMany('mesh-descriptor',  {async: true}),
});
