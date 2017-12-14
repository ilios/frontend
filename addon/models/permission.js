import DS from 'ember-data';

const { attr, belongsTo, Model } = DS;

export default Model.extend({
  canRead: attr('boolean'),
  canWrite: attr('boolean'),
  tableRowId: attr('string'),
  tableName: attr('string'),
  user: belongsTo('user', {async: true}),
});
