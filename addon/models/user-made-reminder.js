import DS from 'ember-data';

const { attr, belongsTo, Model } = DS;

export default Model.extend({
  note: attr('string'),
  createdAt: attr('date'),
  dueDate: attr('date'),
  closed: attr('boolean'),
  user: belongsTo('user', {async: false}),
});
