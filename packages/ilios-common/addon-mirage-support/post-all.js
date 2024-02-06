import { mapBy } from 'ilios-common/utils/array-helpers';
import getName from './get-name';
import parseJsonData from './parse-json-data';

/**
 * Handle posting multiple models at the same time as supported by the Ilios API
 */
const postAll = function (schema, request) {
  //turn /api/programyears?limit=1 into 'programYears'
  const modelRegex = /\/api\/([a-z]+).*/i;
  const modelName = getName(request.url.match(modelRegex)[1]);

  const obj = this.serializerOrRegistry.normalize(JSON.parse(request.requestBody), modelName);
  if (Array.isArray(obj.data)) {
    const models = obj.data.map((item) => {
      const attrs = parseJsonData({ data: item });
      return this.serializerOrRegistry.serialize(schema[modelName].create(attrs));
    });
    return { data: mapBy(models, 'data') };
  }

  const attrs = parseJsonData(obj);
  return this.serializerOrRegistry.serialize(schema[modelName].create(attrs));
};

export { postAll };
