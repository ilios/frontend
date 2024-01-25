import { Model, belongsTo } from 'miragejs';

export default Model.extend({
  descriptor: belongsTo('mesh-descriptor', { inverse: 'trees' }),
});
