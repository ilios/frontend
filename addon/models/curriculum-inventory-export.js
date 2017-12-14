import DS from 'ember-data';

const { attr, belongsTo, Model } = DS;

export default Model.extend({
  createdAt: attr('date'),
  report: belongsTo('curriculum-inventory-report', {async: true}),
  createdBy: belongsTo('user', {async: true}),
});
