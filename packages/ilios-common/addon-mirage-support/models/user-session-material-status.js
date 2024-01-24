import { Model, belongsTo } from 'miragejs';

export default Model.extend({
  user: belongsTo('user', { inverse: 'sessionMaterialStatuses' }),
  material: belongsTo('session-learning-material', { inverse: null }),
});
