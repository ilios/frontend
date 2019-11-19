import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  title: attr('string'),
  description: attr('string'),
  competencies: hasMany('term', {async: true}),
});
