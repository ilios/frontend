import DS from 'ember-data';
import moment from 'moment';

const { RESTSerializer } = DS;

export default RESTSerializer.extend({
  isNewSerializerAPI: true,
  serialize(snapshot, options) {
    let json = this._super(snapshot, options);
    let dueDate = moment(json.dueDate);
    json.dueDate = dueDate.format('YYYY-MM-DD');
    
    //don't persist this, it is handled by the server
    delete json.updatedAt;

    return json;
  },
  normalize(modelClass, resourceHash, prop){
    let dueDate = moment.utc(resourceHash.dueDate).format('YYYY-MM-DD');
    let localDueDate = moment(dueDate, 'YYYY-MM-DD');
    resourceHash.dueDate = localDueDate.format();
    
    return this._super(modelClass, resourceHash, prop);
  }
});
