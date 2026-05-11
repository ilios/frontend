import { Collection } from '@msw/data';
import { schemas, relationships } from './models.js';
import { z } from 'zod';

const schemasWithRelationships = {};

/*
Because we need to recursivly refer to other schemas we need to
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

  schemasWithRelationships[name] = schemas[name];

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
  //check if the string value `id` is actually a number like "3", if so use the number as a Number
  const coercedId = Number.isFinite(Number(id)) ? Number(id) : id;
  const { target } = relationships[modelName].find((r) => r.field === field);
  if (!target) {
    console.error(`Unknown relationship ${field} on ${modelName}`);
  }

  const value = await collections[target].findFirst((q) => q.where({ id: coercedId }));

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

// Export all collections as db object for backwards compatibility
export { collections as db, getRelatedRecord, isRelatedRecord, validateRecordData };
