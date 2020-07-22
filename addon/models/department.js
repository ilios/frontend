import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  title: attr('string'),
  school: belongsTo('school', {async: true}),
});
