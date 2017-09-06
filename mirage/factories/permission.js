import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  user:  null,
  canRead: false,
  canWrite: false,
  tableRowId: null,
  tableName: null,
});
