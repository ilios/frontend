import { Model, belongsTo } from 'miragejs';

export default Model.extend({
  report: belongsTo('curriculum-inventory-report', { inverse: 'export' }),
  createdBy: belongsTo('user', { inverse: null }),
});
