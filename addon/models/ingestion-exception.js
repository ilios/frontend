import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  uid: attr('string'),
  user: belongsTo('user', {async: true}),
});
