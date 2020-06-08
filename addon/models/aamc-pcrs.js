import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  description: attr('string'),
  competencies: hasMany('competency', {async: true}),
});
