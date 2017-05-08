import DS from 'ember-data';

export default DS.Model.extend({
  note: DS.attr('string'),
  createdAt: DS.attr('date'),
  dueDate: DS.attr('date'),
  closed: DS.attr('boolean'),
  user: DS.belongsTo('user', {async: false}),
});
