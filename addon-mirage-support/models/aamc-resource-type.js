import { Model, hasMany } from 'miragejs';

export default Model.extend({
  competencies: hasMany('term', { async: true, inverse: 'aamcResourceTypes' }),
});
