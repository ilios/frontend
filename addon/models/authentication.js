import DS from 'ember-data';

const { attr, belongsTo } = DS;

export default DS.Model.extend({
  password: attr('string'),
  username: attr('string'),
  user: belongsTo('user'),
});
