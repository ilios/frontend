import DS from 'ember-data';

const { attr, belongsTo, Model } = DS;

export default Model.extend({
  type: attr('string'),
  property: attr('string'),
  value: attr('string'),
  user: belongsTo('user', {async: true}),
});
