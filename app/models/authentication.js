import DS from 'ember-data';

const { attr, belongsTo } = DS;

export default DS.Model.extend({
  user: belongsTo('user'),
  username: DS.attr('string'),
  password: DS.attr('string'),
});
