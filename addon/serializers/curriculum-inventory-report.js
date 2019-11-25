import RESTSerializer from '@ember-data/serializer/rest';
import moment from 'moment';

export default RESTSerializer.extend({
  isNewSerializerAPI: true,
  serialize(snapshot, options) {
    var json = this._super(snapshot, options);
    json.startDate = moment.utc(json.startDate).local().format('YYYY-MM-DD');
    json.endDate = moment.utc(json.endDate).local().format('YYYY-MM-DD');
    delete json.absoluteFileUri;
    return json;
  },
  normalize(modelClass, resourceHash, prop) {
    const startDate = moment.utc(resourceHash.startDate).format('YYYY-MM-DD');
    const localStartDate = moment(startDate, 'YYYY-MM-DD');
    resourceHash.startDate = localStartDate.format();
    const endDate = moment.utc(resourceHash.endDate).format('YYYY-MM-DD');
    const localEndDate = moment(endDate, 'YYYY-MM-DD');
    resourceHash.endDate = localEndDate.format();
    return this._super(modelClass, resourceHash, prop);
  }
});
