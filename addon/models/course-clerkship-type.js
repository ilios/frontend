import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  title: attr('string'),
  courses: hasMany('course', {async: true}),
});
