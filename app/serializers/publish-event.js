import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  isNewSerializerAPI: true,
  serialize: function(snapshot, options) {
    var json = this._super(snapshot, options);
    //don't persist these, they are handled by the server
    delete json.machineIp;
    delete json.timeStamp;
    delete json.tableName;
    delete json.tableRowId;
    delete json.administrator;

    return json;
  }
});
