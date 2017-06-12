import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  user: belongsTo(),
  offering: belongsTo(),
  ilmSession: belongsTo(),
});
