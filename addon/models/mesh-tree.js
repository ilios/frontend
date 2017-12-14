import DS from 'ember-data';

const { attr, belongsTo, Model } = DS;

export default Model.extend({
  treeNumber: attr('string'),
  descriptor: belongsTo('mesh-descriptor', {async: true}),
});
