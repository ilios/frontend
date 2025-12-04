import { setupServer } from 'msw/node';
import { db } from './db.js';
import { handlers } from './handlers.js';
import { factoryDefaults } from './factories.js';

// Drop-in replacement for setupMirage() that maintains the same API
export function setupMSW(hooks) {
  hooks.beforeEach(function () {
    this.server = setupServer(...handlers);
    this.server.listen({ onUnhandledRequest: 'error' });

    // Provide Mirage-compatible API
    this.server.create = createModel;
    this.server.createList = createModelList;
    this.server.db = db;
  });

  hooks.afterEach(function () {
    this.server.close();

    // Reset database to clean state
    Object.keys(db).forEach((modelName) => {
      if (modelName !== 'reset') {
        db[modelName].deleteMany({ where: {} });
      }
    });
  });
}

function createModel(modelName, attrs = {}) {
  const model = db[modelName];
  if (!model) {
    throw new Error(`Model '${modelName}' not found in database`);
  }

  // Apply factory defaults
  const defaults = factoryDefaults[modelName] || {};
  const mergedAttrs = { ...applyDefaults(defaults, 0), ...attrs };

  return model.create(mergedAttrs);
}

function createModelList(modelName, count, attrs = {}) {
  const model = db[modelName];
  if (!model) {
    throw new Error(`Model '${modelName}' not found in database`);
  }

  return Array.from({ length: count }, (_, i) => {
    // Apply factory defaults with index
    const defaults = factoryDefaults[modelName] || {};
    const resolvedDefaults = applyDefaults(defaults, i);

    // Resolve user-provided attrs with index
    const resolvedAttrs = {};
    for (const [key, value] of Object.entries(attrs)) {
      resolvedAttrs[key] = typeof value === 'function' ? value(i) : value;
    }

    return model.create({ ...resolvedDefaults, ...resolvedAttrs });
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
