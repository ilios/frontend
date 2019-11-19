import Model, { hasMany, belongsTo, attr } from '@ember-data/model';


export default Model.extend({
  title: attr('string'),
  school: belongsTo('school', {async: true}),
  stewards: hasMany('program-year-steward', {async: true}),
});
