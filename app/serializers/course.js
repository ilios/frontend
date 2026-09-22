import IliosSerializer from './ilios';
import {
  jsonApiUtcSerializeDate,
  jsonApiUtcNormalizeDate,
} from 'ilios-common/utils/json-api-utc-date';

export default class CourseSerializer extends IliosSerializer {
  serialize(snapshot, options) {
    const jsonApiCourse = super.serialize(snapshot, options);
    jsonApiUtcSerializeDate(jsonApiCourse, 'startDate');
    jsonApiUtcSerializeDate(jsonApiCourse, 'endDate');
    return jsonApiCourse;
  }
  normalize(modelClass, resourceHash, prop) {
    jsonApiUtcNormalizeDate(resourceHash, 'startDate');
    jsonApiUtcNormalizeDate(resourceHash, 'endDate');
    return super.normalize(modelClass, resourceHash, prop);
  }
}
