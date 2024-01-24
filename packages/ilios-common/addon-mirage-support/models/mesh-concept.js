import { Model, hasMany } from 'miragejs';

export default Model.extend({
  terms: hasMany('mesh-term', { inverse: 'concepts' }),
  descriptors: hasMany('mesh-descriptor', { inverse: 'concepts' }),
});
