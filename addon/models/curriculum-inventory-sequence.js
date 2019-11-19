import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  description: attr('string'),
  report: belongsTo('curriculum-inventory-report', {async: true}),
});
