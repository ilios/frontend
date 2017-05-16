import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  user:  association(),
  canRead: false,
  canWrite: false,
  tableRowId: null,
  tableName: null,
});
