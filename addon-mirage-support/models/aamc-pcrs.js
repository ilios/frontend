import { Model, hasMany } from 'miragejs';

export default Model.extend({
  competencies: hasMany('competency', { async: true, inverse: 'aamcPcrses' }),
});
