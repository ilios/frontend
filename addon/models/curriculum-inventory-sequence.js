import DS from 'ember-data';

const { attr, belongsTo, Model } = DS;

export default Model.extend({
  description: attr('string'),
  report: belongsTo('curriculum-inventory-report', {async: true}),
});
