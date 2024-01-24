import { Model, hasMany } from 'miragejs';

export default Model.extend({
  concepts: hasMany('mesh-concept', { inverse: 'meshTerms' }),
});
