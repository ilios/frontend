import DS from 'ember-data';

const { attr, belongsTo, hasMany, Model } = DS;


export default Model.extend({
  title: attr('string'),
  school: belongsTo('school', {async: true}),
  stewards: hasMany('program-year-steward', {async: true}),
});
