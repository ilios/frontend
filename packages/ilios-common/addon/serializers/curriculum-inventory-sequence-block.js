import IliosSerializer from './ilios';
import {
  jsonApiUtcSerializeDate,
  jsonApiUtcNormalizeDate,
} from 'ilios-common/utils/json-api-utc-date';

export default class CurriculumInventorySequenceBlockSerializer extends IliosSerializer {
  serialize(snapshot, options) {
    const json = super.serialize(snapshot, options);
    if (json.data.attributes.startDate) {
      jsonApiUtcSerializeDate(json, 'startDate');
    }
    if (json.data.attributes.endDate) {
      jsonApiUtcSerializeDate(json, 'endDate');
    }
    return json;
  }
  normalize(modelClass, resourceHash, prop) {
    if (resourceHash.attributes.startDate) {
      jsonApiUtcNormalizeDate(resourceHash, 'startDate');
    }
    if (resourceHash.attributes.endDate) {
      jsonApiUtcNormalizeDate(resourceHash, 'endDate');
    }
    return super.normalize(modelClass, resourceHash, prop);
  }
}
