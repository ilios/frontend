import DS from 'ember-data';

const { belongsTo, Model } = DS;

export default Model.extend({
  department: belongsTo('department', {async: true}),
  programYear: belongsTo('program-year', {async: true}),
  school: belongsTo('school', {async: true}),
});
