import DS from 'ember-data';

export default DS.Model.extend({
  type: DS.attr('string'),
  property: DS.attr('string'),
  value: DS.attr('string'),
  user: DS.belongsTo('user', {async: true}),
});
