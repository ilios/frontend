import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  alerts: DS.hasMany('alert', {async: true}),
});
