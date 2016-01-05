import DS from 'ember-data';
import moment from 'moment';

const { RESTSerializer } = DS;

export default RESTSerializer.extend({
  isNewSerializerAPI: true,
  serialize(snapshot, options) {
    let json = this._super(snapshot, options);

    // set time to 5pm, always.
    let dueDate = moment(json.dueDate);
    dueDate.hour('17');
    dueDate.minute('00');
    json.dueDate = dueDate.format();

    //don't persist this, it is handled by the server
    delete json.updatedAt;
    return json;
  }
});
