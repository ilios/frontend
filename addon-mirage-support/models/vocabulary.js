import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  school: belongsTo('school', { inverse: 'vocabularies' }),
  terms: hasMany('term', { inverse: 'vocabulary' }),
});
