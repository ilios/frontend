import { Model, hasMany } from 'miragejs';

export default Model.extend({
  competencies: hasMany('competency', { inverse: 'aamcPcrses' }),
});
