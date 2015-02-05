import DS from 'ember-data';

export default DS.Model.extend({
  users: DS.hasMany('user', {async: true}),
});
