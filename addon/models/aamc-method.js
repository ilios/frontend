import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  description: attr('string'),
  sessionTypes: hasMany('session-type', {async: true}),
  active: attr('boolean')
});
