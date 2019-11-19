import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  previousIndexing: attr('string'),
  descriptor: belongsTo('mesh-descriptor', {async: true}),
});
