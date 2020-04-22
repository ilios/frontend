import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  course: belongsTo('course', { async: true }),
  objective: belongsTo('objective', { async: true }),
  position: attr('number', { defaultValue: 0 }),
  terms: hasMany('term', { async: true }),
});
