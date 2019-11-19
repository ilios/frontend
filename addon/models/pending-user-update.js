import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  type: attr('string'),
  property: attr('string'),
  value: attr('string'),
  user: belongsTo('user', {async: true}),
});
