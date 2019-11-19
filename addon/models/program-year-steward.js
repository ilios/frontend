import Model, { belongsTo } from '@ember-data/model';

export default Model.extend({
  department: belongsTo('department', {async: true}),
  programYear: belongsTo('program-year', {async: true}),
  school: belongsTo('school', {async: true}),
});
