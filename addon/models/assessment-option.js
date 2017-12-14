import DS from 'ember-data';

const { attr, hasMany, Model } = DS;

export default Model.extend({
  name: attr('string'),
  sessionTypes: hasMany('session-type', {async: true}),
});
