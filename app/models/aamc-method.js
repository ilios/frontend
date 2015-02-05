import DS from 'ember-data';

export default DS.Model.extend({
  sessionTypes: DS.hasMany('session-type', {async: true}),
});
