import { RestSerializer } from 'ember-cli-mirage';
import { pluralize, camelize, dasherize } from 'ember-cli-mirage/utils/inflector';

export default RestSerializer.extend({
  serializeIds: 'always',
  normalizeIds: 'always',
  normalize(payload) {
    let type = Object.keys(payload)[0];
    let attrs = payload[type];
    let modelName = camelize(type);
    let model = this.schema.modelFor(modelName);
    let { belongsToAssociations, hasManyAssociations } = model.class.prototype;
    let belongsToKeys = Object.keys(belongsToAssociations);
    let hasManyKeys = Object.keys(hasManyAssociations);

    let jsonApiPayload = {
      data: {
        type: pluralize(type),
        attributes: {}
      }
    };
    if (attrs.id) {
      jsonApiPayload.data.id = attrs.id;
    }

    let relationships = {};

    Object.keys(attrs).forEach((key) => {
      if (key !== 'id') {
        if (this.normalizeIds) {
          if (belongsToKeys.includes(key)) {
            let association = belongsToAssociations[key];
            let associationModel = association.modelName;
            relationships[dasherize(key)] = {
              data: {
                type: associationModel,
                id: attrs[key]
              }
            };
          } else if (hasManyKeys.includes(key)) {
            let association = hasManyAssociations[key];
            let associationModel = association.modelName;
            let data = attrs[key].map(id => {
              return {
                type: associationModel,
                id
              };
            });
            relationships[dasherize(key)] = { data };
          } else {
            jsonApiPayload.data.attributes[dasherize(key)] = attrs[key];
          }
        } else {
          jsonApiPayload.data.attributes[dasherize(key)] = attrs[key];
        }
      }
    });
    if (Object.keys(relationships).length) {
      jsonApiPayload.data.relationships = relationships;
    }

    return jsonApiPayload;
  }
});
