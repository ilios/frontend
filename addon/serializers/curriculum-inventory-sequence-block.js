import DS from 'ember-data';
import moment from 'moment';

export default DS.RESTSerializer.extend({
  isNewSerializerAPI: true,
  serialize(snapshot, options) {
    var json = this._super(snapshot, options);
    if (json.startDate) {
      json.startDate = moment.utc(json.startDate).local().format('YYYY-MM-DD');
    }
    if (json.endDate) {
      json.endDate = moment.utc(json.endDate).local().format('YYYY-MM-DD');
    }
    return json;
  },
  normalize(modelClass, resourceHash, prop) {
    if (resourceHash.startDate) {
      let startDate = moment.utc(resourceHash.startDate).format('YYYY-MM-DD');
      let localStartDate = moment(startDate, 'YYYY-MM-DD');
      resourceHash.startDate = localStartDate.format();
    }
    if (resourceHash.endDate) {
      let endDate = moment.utc(resourceHash.endDate).format('YYYY-MM-DD');
      let localEndDate = moment(endDate, 'YYYY-MM-DD');
      resourceHash.endDate = localEndDate.format();
    }
    return this._super(modelClass, resourceHash, prop);
  }
});
