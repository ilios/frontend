import DS from 'ember-data';

const { attr, belongsTo, Model } = DS;

export default Model.extend({
  previousIndexing: attr('string'),
  descriptor: belongsTo('mesh-descriptor', {async: true}),
});
