import { Model, belongsTo } from 'miragejs';

export default Model.extend({
  user: belongsTo('user', { inverse: 'reports' }),
  school: belongsTo('school', { inverse: null }),
});
