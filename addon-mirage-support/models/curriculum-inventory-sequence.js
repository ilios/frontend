import { Model, belongsTo } from 'miragejs';

export default Model.extend({
  report: belongsTo('curriculum-inventory-report', { inverse: 'sequence' }),
});
