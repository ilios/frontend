import { HttpResponse } from 'msw';
import { singularize } from 'ember-inflector';
import { db, getRelatedRecord, validateRecordData, modelsWithStringIds } from '../db.js';
import { getIdentityManager } from '../utils/identity-managers.js';

async function extractRelationshipsInUpdate(modelName, data, attrs) {
  if (data.relationships) {
    const keys = Object.keys(data.relationships);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const relationship = data.relationships[key];

      if (Array.isArray(relationship.data)) {
        attrs[key] = await Promise.all(
          relationship.data.map((item) => {
            const relatedModelName = singularize(item.type);
            const id = modelsWithStringIds.has(relatedModelName) ? item.id : Number(item.id);
            return getRelatedRecord(modelName, key, id);
          }),
        );
      } else {
        if (relationship.data) {
          const relatedModelName = singularize(relationship.data.type);
          const id = modelsWithStringIds.has(relatedModelName)
            ? relationship.data.id
            : Number(relationship.data.id);
          attrs[key] = relationship.data ? await getRelatedRecord(modelName, key, id) : null;
        } else {
          attrs[key] = undefined;
        }
      }
    }
  }
}

async function createFromPostData(modelName, data) {
  if (!data) {
    return new HttpResponse(JSON.stringify({ errors: ['Invalid request body'] }), {
      status: 400,
    });
  }

  // Extract attributes
  const attrs = { ...data.attributes };

  if (!attrs.id) {
    // Auto-generate an ID if it doesn't exist yet.
    attrs.id = getIdentityManager(modelName).getNextId();
  }
  await extractRelationshipsInUpdate(modelName, data, attrs);

  validateRecordData(modelName, attrs);

  return await db[modelName].create(attrs);
}

export { extractRelationshipsInUpdate, createFromPostData };
