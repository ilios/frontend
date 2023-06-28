import { Model, hasMany } from 'miragejs';

export default Model.extend({
  descriptors: hasMany('mesh-descriptor', { inverse: 'meshQualifier' }),
});
