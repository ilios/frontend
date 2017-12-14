import DS from 'ember-data';

const { attr, belongsTo, Model } = DS;

export default Model.extend({
  uid: attr('string'),
  user: belongsTo('user', {async: true}),
});
