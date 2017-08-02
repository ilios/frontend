import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  isNewSerializerAPI: true,
  serialize(snapshot, options) {
    var json = this._super(snapshot, options);

    //don't persist this, it is handled by the server
    delete json.createdAt;
    delete json.createdBy;
    delete json.document;
    return json;
  }
});
