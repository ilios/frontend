import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  objective: belongsTo('objective', { async: true }),
  position: attr('number', { defaultValue: 0 }),
  session: belongsTo('session', { async: true }),
  terms: hasMany('term', { async: true }),
});
