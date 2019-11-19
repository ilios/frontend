import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  name: attr('string'),
  value: attr('string'),
  school: belongsTo('school', {async: true}),
});
