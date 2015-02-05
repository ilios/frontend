import DS from 'ember-data';

export default DS.Model.extend({
  tableRowId: DS.attr('string'),
  tableName: DS.attr('string'),
  dispatched: DS.attr('boolean'),
  changeTypes: DS.hasMany('alert-change-type', {async: true}),
  instigators: DS.hasMany('user', {async: true}),
  recipients: DS.hasMany('school', {async: true}),
});
