import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  school: belongsTo(),
  roles: hasMany('user-role'),
  authentication: belongsTo(),
});
