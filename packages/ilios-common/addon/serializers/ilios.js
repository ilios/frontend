import JSONAPISerializer from '@ember-data/serializer/json-api';
import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';

export default class IliosSerializer extends JSONAPISerializer {
  keyForAttribute(key) {
    return camelize(key);
  }
  keyForRelationship(key) {
    return camelize(key);
  }
  payloadKeyFromModelName(modelName) {
    return pluralize(camelize(modelName));
  }
}
