import DS from 'ember-data';

export default DS.Model.extend({
  offerings: DS.hasMany('offering', {async: true}),
});
