import { http, HttpResponse } from 'msw';
import { settled } from '@ember/test-helpers';
import { startMSW } from './start-msw.js';
import { db } from './db.js';
import { factoryDefaults } from './factories.js';
import { generateId, resetIdCounter } from './create-model.js';

// Drop-in replacement for setupMSW() that maintains the same API
export function setupMSW(hooks) {
  hooks.beforeEach(async function () {
    if (!this.owner) {
      throw new Error(
        'Must call one of the ember-qunit setupTest() / setupRenderingTest() / setupApplicationTest() first',
      );
    }

    // Reset ID counter for each test
    resetIdCounter();

    // Get ENV from the owner to pass apiVersion
    const ENV = this.owner.resolveRegistration('config:environment');
    const { apiVersion } = ENV;

    this.server = await startMSW({ apiVersion });
    await this.server.start({ onUnhandledRequest: 'warn' });

    // Provide Mirage-compatible API
    this.server.create = createModel;
    this.server.createList = createModelList;
    this.server.db = db;
    this.server.get = get.bind(this);
  });

  hooks.afterEach(async function () {
    await settled();

    if (this.server) {
      this.server.stop();
      delete this.server;
    }

    // Reset database to clean state
    await Promise.all(
      Object.keys(db).map(async (modelName) => {
        const collection = db[modelName];
        if (collection && typeof collection.findMany === 'function') {
          const records = await collection.findMany();
          await Promise.all(
            records.map((record) => collection.delete({ where: { id: { equals: record.id } } })),
          );
        }
      }),
    );

    // Reset ID counter
    resetIdCounter();
  });
}

function createModel(modelName, attrs = {}) {
  const collection = db[modelName];
  if (!collection) {
    throw new Error(`Model '${modelName}' not found in database`);
  }

  // Apply factory defaults
  const defaults = factoryDefaults[modelName] || {};
  const mergedAttrs = { ...applyDefaults(defaults, 0), ...attrs };

  // Generate ID if not provided
  if (!mergedAttrs.id) {
    mergedAttrs.id = generateId();
  }

  // Return promise from collection.create()
  return collection.create(mergedAttrs);
}

function createModelList(modelName, count, attrs = {}) {
  const collection = db[modelName];
  if (!collection) {
    throw new Error(`Model '${modelName}' not found in database`);
  }

  // Return array of promises since create() may be async
  return Array.from({ length: count }, (_, i) => {
    // Apply factory defaults with index
    const defaults = factoryDefaults[modelName] || {};
    const resolvedDefaults = applyDefaults(defaults, i);

    // Resolve user-provided attrs with index
    const resolvedAttrs = {};
    for (const [key, value] of Object.entries(attrs)) {
      resolvedAttrs[key] = typeof value === 'function' ? value(i) : value;
    }

    // Generate ID if not provided
    const mergedAttrs = { ...resolvedDefaults, ...resolvedAttrs };
    if (!mergedAttrs.id) {
      mergedAttrs.id = generateId();
    }

    return collection.create(mergedAttrs);
  });
}

// Apply factory defaults, calling functions with index
function applyDefaults(defaults, index) {
  const resolved = {};
  for (const [key, value] of Object.entries(defaults)) {
    if (typeof value === 'function') {
      // For non-arrow functions, bind the resolved object as 'this'
      if (value.prototype) {
        resolved[key] = value.call(resolved, index);
      } else {
        resolved[key] = value(index);
      }
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}

function get(url, callback) {
  this.server.use(
    http.get(
      url,
      () => {
        return HttpResponse.json(callback());
      },
      { once: true },
    ),
  );
}
