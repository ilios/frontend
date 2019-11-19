import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  password: attr('string'),
  username: attr('string'),
  user: belongsTo('user'),
});
