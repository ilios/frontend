import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  sessionType: belongsTo(),
  offerings: hasMany(),
});
