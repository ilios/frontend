import { primaryKey, nullable, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export function createPrimaryKey() {
  return primaryKey(() => String(idCounter++));
}

export function resetIdCounter() {
  idCounter = 1;
}

// Creates a model definition with auto-incrementing ID
export function createModelDefinition(definition) {
  return {
    id: createPrimaryKey(),
    ...definition,
  };
}

export { oneOf, manyOf, nullable };
