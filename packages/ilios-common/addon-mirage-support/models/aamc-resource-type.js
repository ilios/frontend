import { Model, hasMany } from 'miragejs';

export default Model.extend({
  competencies: hasMany('term', { inverse: 'aamcResourceTypes' }),
});
