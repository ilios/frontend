import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  treeNumber: attr('string'),
  descriptor: belongsTo('mesh-descriptor', {async: true}),
});
