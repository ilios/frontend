import RESTSerializer from '@ember-data/serializer/rest';
import moment from 'moment';

export default RESTSerializer.extend({
  isNewSerializerAPI: true,
  serialize(snapshot, options) {
    const json = this._super(snapshot, options);

    // set time to 5pm, always.
    const dueDate = moment(json.dueDate);
    dueDate.hour('17');
    dueDate.minute('00');
    json.dueDate = dueDate.format();

    //don't persist this, it is handled by the server
    delete json.updatedAt;
    return json;
  }
});
