import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  sessionTypes: DS.hasMany('session-type', {async: true}),
});
