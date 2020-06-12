import IliosSerializer from './ilios';
import moment from 'moment';

export default class IlmSessionSerializer extends IliosSerializer {
  serialize(snapshot, options) {
    const json = super.serialize(snapshot, options);
    // set time to 5pm, always.
    const dueDate = moment(json.data.attributes.dueDate);
    dueDate.hour('17');
    dueDate.minute('00');
    json.data.attributes.dueDate = dueDate.format();

    //don't persist this, it is handled by the server
    delete json.data.attributes.updatedAt;
    return json;
  }
}
