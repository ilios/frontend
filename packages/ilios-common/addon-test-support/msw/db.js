import { Collection } from '@msw/data';
import { schemas, relationships } from './models.js';
import { z } from 'zod';
import { camelize } from '@ember/string';

// Almost all of our models has numeric IDs, except MeSH related data points.
// We'll need to distinguish between those and the rest when creating IDs for our mock models.
const modelsWithStringIds = new Set([
  'meshConcept',
  'meshDescriptor',
  'meshQualifier',
  'meshPreviousIndexing',
  'meshTerm',
  'meshTree',
]);

const schemasWithRelationships = {};

/*
Because we need to recursively refer to other schemas we need to
dynamically assign getters for the relation properties.
*/
Object.keys(relationships).forEach((name) => {
  const r = relationships[name].reduce((r, { field, type, target }) => {
    Object.defineProperty(r, field, {
      enumerable: true,
      configurable: true,
      get: () => {
        if (type === 'manyOf') {
          return z.optional(z.array(schemas[target]));
        }
        return z.optional(schemas[target]);
      },
    });

    return r;
  }, {});

  schemasWithRelationships[name] = z.object({
    ...schemas[name].shape, //special .shape zod method makes this work
    ...r,
  });
});

const collections = {};
Object.keys(schemas).forEach((name) => {
  collections[name] = new Collection({ schema: schemasWithRelationships[name] });
});

Object.keys(relationships).forEach((name) => {
  collections[name].defineRelations(({ many, one }) => {
    return relationships[name].reduce((r, { field, type, target, role }) => {
      const opts = {};
      if (role) {
        opts['role'] = role;
      }
      switch (type) {
        case 'oneOf':
          r[field] = one(collections[target], opts);
          break;
        case 'manyOf':
          r[field] = many(collections[target], opts);
          break;
        default:
          console.error(`Unknown relationships type ${type} on ${name}:${field} for ${target}`);
      }

      return r;
    }, {});
  });
});

function isRelatedRecord(modelName, field) {
  return relationships[modelName].some((r) => r.field === field);
}

async function getRelatedRecord(modelName, field, id) {
  const { target } = relationships[modelName].find((r) => r.field === field);
  if (!target) {
    console.error(`Unknown relationship ${field} on ${modelName}`);
  }

  id = modelsWithStringIds.has(target) ? id : Number(id);
  const value = await collections[target].findFirst((q) => q.where({ id }));

  if (!value) {
    console.error(`Unable to get ${target}:${id}`);
  }

  return value;
}

function validateRecordData(modelName, obj) {
  try {
    collections[modelName].options.schema.parse(obj);
  } catch (e) {
    const errors = e.issues.map(({ path, message }) => `${message} for "${path}"`);
    const message = `Schema Errors for "${modelName}": [\n  ` + errors.join('\n  ') + '\n]';
    throw new Error(message);
  }
}
/**
 * @param {string} modelName
 * @param {array} records
 * @param {object} params
 * @returns {Promise<[]>}
 */
async function filterByParams(modelName, records, params) {
  params = new Map(Object.entries(params));
  if (!params.size) {
    return records;
  }
  const recordFilterResults = await Promise.all(
    records.map(async (r) => {
      const filterResults = await Array.fromAsync(params, ([param, value]) => {
        return filterByParam(modelName, r, param, value);
      });
      return {
        r,
        matchesAllFilters: filterResults.every((v) => v === true),
      };
    }),
  );

  return recordFilterResults
    .filter(({ matchesAllFilters }) => matchesAllFilters === true)
    .map(({ r }) => r);
}

/**
 * @param {string} modelName
 * @param {object} record
 * @param {string} param
 * @param {*} value
 * @returns {boolean}
 */
function filterByParam(modelName, record, param, value) {
  // first, let's check on the given filter value.
  // check if the given filter value it's blank or an empty array.
  // since there's nothing to filter on, we'll treat these as a success.
  if ('' === value) {
    return true;
  }
  if (Array.isArray(value) && !value.length) {
    return true;
  }

  // then, let's get the name and value of the record's field that we're going to filter on.
  const fieldName = camelize(param);
  if (!Object.hasOwn(record, fieldName)) {
    return false;
  }
  const fieldValue = record[fieldName];

  // filter non-relationship fields
  if (!isRelatedRecord(modelName, param)) {
    if (Array.isArray(value)) {
      return value.includes(String(fieldValue));
    }
    return String(fieldValue) === String(value);
  }

  // filter relationship field by comparing record IDs.
  if (Array.isArray(fieldValue)) {
    const fieldValueIds = fieldValue.map(({ id }) => String(id));
    if (Array.isArray(value)) {
      return value.some((v) => {
        return fieldValueIds.includes(v);
      });
    } else {
      return fieldValueIds.includes(value);
    }
  }
  const fieldValueId = String(fieldValue.id);
  if (Array.isArray(value)) {
    return value.includes(fieldValueId);
  }
  return value === fieldValueId;
}
// Export all collections as db object for backwards compatibility
export {
  collections as db,
  getRelatedRecord,
  isRelatedRecord,
  validateRecordData,
  modelsWithStringIds,
  filterByParams,
};
