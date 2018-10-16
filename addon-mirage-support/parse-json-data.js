import { camelize, singularize } from 'ember-cli-mirage/utils/inflector';

export default function parseJsonData(json){
  let attrs = {};

  if (json.data.attributes) {
    attrs = Object.keys(json.data.attributes).reduce((sum, key) => {
      sum[camelize(key)] = json.data.attributes[key];
      return sum;
    }, {});
  }

  if (json.data.relationships) {
    Object.keys(json.data.relationships).forEach((key) => {
      let relationship = json.data.relationships[key];

      if (Array.isArray(relationship.data)) {
        attrs[`${camelize(singularize(key))}Ids`] = relationship.data.map(rel => rel.id);
      } else {
        attrs[`${camelize(key)}Id`] = relationship.data && relationship.data.id;
      }
    }, {});
  }

  return attrs;
}
