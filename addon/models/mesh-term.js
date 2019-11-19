import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  meshTermUid: attr('string'),
  name: attr('string'),
  lexicalTag: attr('string'),
  conceptPreferred: attr('string'),
  recordPreferred: attr('string'),
  permuted: attr('string'),
  createdAt: attr('date'),
  updatedAt: attr('date'),
  concepts: hasMany('mesh-concept', {async: true}),
});
