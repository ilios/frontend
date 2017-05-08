import DS from 'ember-data';

export default DS.Model.extend({
  meshTermUid: DS.attr('string'),
  name: DS.attr('string'),
  lexicalTag: DS.attr('string'),
  conceptPreferred: DS.attr('string'),
  recordPreferred: DS.attr('string'),
  permuted: DS.attr('string'),
  printable: DS.attr('string'),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),
  concepts: DS.hasMany('mesh-concept', {async: true}),
});
