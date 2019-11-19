import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  createdAt: attr('date'),
  report: belongsTo('curriculum-inventory-report', {async: true}),
  createdBy: belongsTo('user', {async: true}),
});
