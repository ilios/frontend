import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';
import { getTypeFor } from '../relationships';

// Transforms @msw/data records into JSON:API format compatible with Ember Data
export function formatJsonApi(data, modelName, options = {}) {
  const { included = [], meta = null } = options;
  const isCollection = Array.isArray(data);

  const response = {
    data: isCollection
      ? data.map((item) => formatResource(item, modelName))
      : formatResource(data, modelName),
  };

  if (included.length > 0) {
    response.included = formatIncluded(data, included);
  }

  if (meta) {
    response.meta = meta;
  }

  return response;
}

function formatResource(model, modelName) {
  if (!model) {
    return null;
  }

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
    } else if (Array.isArray(value) && value[0]?.id) {
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

function formatIncluded(data, includeList) {
  const included = [];
  const seen = new Set();

  const items = Array.isArray(data) ? data : [data];

  for (const item of items) {
    for (const relationshipName of includeList) {
      const related = item[relationshipName];
      if (!related) continue;

      const relatedItems = Array.isArray(related) ? related : [related];

      for (const relatedItem of relatedItems) {
        const key = `${relatedItem.__typename}-${relatedItem.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          included.push(formatResource(relatedItem, relatedItem.__typename));
        }
      }
    }
  }

  return included;
}

export default formatJsonApi;
