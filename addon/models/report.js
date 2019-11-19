import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  title: attr('string'),
  createdAt: attr('date'),
  subject: attr('string'),
  prepositionalObject: attr('string'),
  prepositionalObjectTableRowId: attr('string'),
  user: belongsTo('user', {async: true}),
  school: belongsTo('school', {async: true}),
});
