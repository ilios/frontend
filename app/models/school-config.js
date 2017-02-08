import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  school: belongsTo('school', {async: true}),
  name: attr('string'),
  value: attr('string'),
});
