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
    return relationships[name].reduce((r, { field, type, target }) => {
      switch (type) {
        case 'oneOf':
          r[field] = one(collections[target]);
          break;
        case 'manyOf':
          r[field] = many(collections[target]);
          break;
        default:
          console.error(`Unknown relationships type ${type} on ${name}:${field} for ${target}`);
      }

      return r;
    }, {});
  });
});

// Export all collections as db object for backwards compatibility
export { collections as db };
