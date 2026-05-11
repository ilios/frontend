import { factoryDefaults } from './factories.js';
import { db, validateRecordData } from './db.js';
import { IdentityManager } from './utils/identity-manager.js';
import { camelize } from '@ember/string';

const identityManagers = new Map();
const factoryCounters = new Map();

export function createModel(modelName, attrs = {}) {
  const name = camelize(modelName);
  const collection = db[name];
  if (!collection) {
    throw new Error(`Model '${name}' not found in database`);
  }

  const obj = factory(name, attrs);
  validateRecordData(modelName, attrs);

  return collection.create(obj);
}

export function createModelList(modelName, count, attrs = {}) {
  const name = camelize(modelName);
  const collection = db[name];
  if (!collection) {
    throw new Error(`Model '${name}' not found in database`);
  }

  const promises = [];
  for (let i = 0; i < count; i++) {
    const object = factory(name, attrs);
    promises.push(collection.create(object));
  }

  return Promise.all(promises);
}

function factory(modelName, attrs) {
  const n = incrementFactoryCounter(modelName);
  const defaults = factoryDefaults[modelName] || {};

  const built = {};

  for (const [key, value] of Object.entries(defaults)) {
    if (typeof value === 'function') {
      // For non-arrow functions, bind the resolved object as 'this'
      if (value.prototype) {
        built[key] = value.call(built, n);
      } else {
        built[key] = value(n);
      }
    } else {
      built[key] = value;
    }
  }

  //combine our factory object with user passed attrs
  const rhett = { ...built, ...attrs };
  // always increment regardless of whether the id has been provided or not.
  // this is to keep us consistent with Mirage's behaviour.
  const id = getIdentityManager(modelName).inc();
  if (!rhett.id) {
    rhett.id = id;
  }

  return rhett;
}

function getIdentityManager(modelName) {
  if (!identityManagers.has(modelName)) {
    identityManagers.set(modelName, new IdentityManager());
  }

  return identityManagers.get(modelName);
}

function incrementFactoryCounter(modelName) {
  if (!factoryCounters.has(modelName)) {
    factoryCounters.set(modelName, 0);
  }
  const rhett = factoryCounters.get(modelName);
  factoryCounters.set(modelName, rhett + 1);
  return rhett;
}

export function resetIdCounter() {
  identityManagers.forEach((idM) => idM.reset());
  factoryCounters.clear();
}
