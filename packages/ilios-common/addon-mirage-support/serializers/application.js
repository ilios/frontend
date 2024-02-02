import { JSONAPISerializer } from 'miragejs';
import { camelize } from '@ember/string';

export default JSONAPISerializer.extend({
  serializeIds: 'always',
  normalizeIds: 'always',
  alwaysIncludeLinkageData: true,
  keyForAttribute(key) {
    return camelize(key);
  },
  keyForRelationship(key) {
    return camelize(key);
  },
  typeKeyForModel(model) {
    return camelize(this._container.inflector.pluralize(model.modelName));
  },
});
