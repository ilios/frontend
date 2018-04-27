import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  canRead: false,
  canWrite: false,
  tableRowId: null,
  tableName: null,
});
