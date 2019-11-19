import RESTSerializer from '@ember-data/serializer/rest';

export default RESTSerializer.extend({
  isNewSerializerAPI: true,
  serialize(snapshot, options) {
    var json = this._super(snapshot, options);
    //don't persist this, it is handled by the server
    delete json.updatedAt;

    return json;
  }
});
