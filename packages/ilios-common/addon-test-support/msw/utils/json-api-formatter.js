import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';
import { getTypeFor } from '../relationships';

// Transforms @msw/data records into JSON:API format compatible with Ember Data
export function formatJsonApi(data, modelName, options = {}) {
  const { include = null, meta = null } = options;
  const isCollection = Array.isArray(data);

  const response = {
    data: isCollection
      ? data.map((item) => formatResource(item, modelName))
      : formatResource(data, modelName),
  };

  if (include?.length > 0) {
    const included = new Map();
    addIncluded(modelName, data, include, included);

    response.included = included.values().toArray();
  }

  if (meta) {
    response.meta = meta;
  }

  return response;
}

function formatResource(model, modelName) {
  const type = pluralize(camelize(modelName));
  const attributes = {};
  const relationships = {};

  // Separate attributes from relationships
  for (const [key, value] of Object.entries(model)) {
    if (key.startsWith('__') || key === 'id') {
      continue;
    }

    // Relationships are objects or arrays with IDs
    if (value && typeof value === 'object' && value.id) {
      relationships[camelize(key)] = formatRelationship(value, getTypeFor(modelName, key));
    } else if (Array.isArray(value) && (!value.length || value[0]?.id)) {
      relationships[camelize(key)] = formatRelationship(value, getTypeFor(modelName, key));
    } else {
      attributes[camelize(key)] = value;
    }
  }

  const resource = {
    type,
    id: String(model.id),
    attributes,
  };

  if (Object.keys(relationships).length > 0) {
    resource.relationships = relationships;
  }
  return resource;
}

function formatRelationship(related, typeName) {
  const type = pluralize(camelize(typeName));
  if (Array.isArray(related)) {
    return {
      data: related.map((item) => ({
        type,
        id: String(item.id),
      })),
    };
  }

  return {
    data: related
      ? {
          type,
          id: String(related.id),
        }
      : null,
  };
}

function addIncluded(modelName, data, includeList, included) {
  const includes = includeList.split(',');

  const items = Array.isArray(data) ? data : [data];

  for (const item of items) {
    for (const include of includes) {
      const includedItems = include.split('.');
      const field = includedItems.shift();

      const related = item[field];

      if (related) {
        const relatedItems = Array.isArray(related) ? related : [related];
        const type = getTypeFor(modelName, field);
        for (const relatedItem of relatedItems) {
          const resource = formatResource(relatedItem, type);
          included.set(`${resource.type}-${resource.id}`, resource);
          if (includedItems.length) {
            addIncluded(type, relatedItem, includedItems.join('.'), included);
          }
        }
      }
    }
  }
}

export default formatJsonApi;
