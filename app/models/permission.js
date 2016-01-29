import DS from 'ember-data';

export default DS.Model.extend({
  user: DS.belongsTo('user', {async: true}),
  canRead: DS.attr('boolean'),
  canWrite: DS.attr('boolean'),
  tableRowId: DS.attr('string'),
  tableName: DS.attr('string'),
});
