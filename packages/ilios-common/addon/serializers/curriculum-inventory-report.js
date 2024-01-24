import IliosSerializer from './ilios';
import {
  jsonApiUtcSerializeDate,
  jsonApiUtcNormalizeDate,
} from 'ilios-common/utils/json-api-utc-date';

export default class CurriculumInventoryReportSerializer extends IliosSerializer {
  serialize(snapshot, options) {
    const json = super.serialize(snapshot, options);
    jsonApiUtcSerializeDate(json, 'startDate');
    jsonApiUtcSerializeDate(json, 'endDate');
    delete json.data.attributes.absoluteFileUri;
    return json;
  }
  normalize(modelClass, resourceHash, prop) {
    jsonApiUtcNormalizeDate(resourceHash, 'startDate');
    jsonApiUtcNormalizeDate(resourceHash, 'endDate');
    return super.normalize(modelClass, resourceHash, prop);
  }
}
