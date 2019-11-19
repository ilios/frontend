import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  note: attr('string'),
  createdAt: attr('date'),
  dueDate: attr('date'),
  closed: attr('boolean'),
  user: belongsTo('user', {async: false}),
});
