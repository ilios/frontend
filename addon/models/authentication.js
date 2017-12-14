import DS from 'ember-data';

const { attr, belongsTo, Model } = DS;

export default Model.extend({
  password: attr('string'),
  username: attr('string'),
  user: belongsTo('user'),
});
