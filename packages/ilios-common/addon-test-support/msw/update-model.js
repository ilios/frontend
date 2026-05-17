import { db } from './db.js';

/**
 * Updates a given record with given attributes in a given collection.
 *
 * @param { string } collectionName The name of the model collection that the given model belongs to.
 * @param { object } model The model to update
 * @param { obj } attrs an object holding the model attributes to update as key/value pairs.
 * @returns { object } The updated model.
 *
 */
export async function updateModel(collectionName, model, attrs) {
  if (!Object.hasOwn(db, collectionName)) {
    console.error(`Unknown collection ${collectionName} in mock database.`);
  }
  attrs = new Map(Object.entries(attrs));
  if (!attrs.size) {
    return;
  }

  const collection = db[collectionName];
  return await collection.update(model, {
    data(model) {
      attrs.forEach((v, k) => {
        model[k] = v;
      });
    },
  });
}
