import DS from 'ember-data';

const { attr, belongsTo } = DS;

export default DS.Model.extend({
  user: belongsTo('user'),
  username: attr('string'),
  password: attr('string'),
});
