import DS from 'ember-data';

export default DS.Model.extend({
  uid: DS.attr('string'),
  deleted: DS.attr('boolean'),
  user: DS.belongsTo('user', {async: true}),
});
