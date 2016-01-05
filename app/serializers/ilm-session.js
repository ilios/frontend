import DS from 'ember-data';
import moment from 'moment';

const { RESTSerializer } = DS;

export default RESTSerializer.extend({
  isNewSerializerAPI: true,
  serialize(snapshot, options) {
    let json = this._super(snapshot, options);

    //don't persist this, it is handled by the server
    delete json.updatedAt;
    return json;
  }
});
