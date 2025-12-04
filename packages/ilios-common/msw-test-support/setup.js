import { setupServer } from 'msw/node';
import { db } from './db.js';
import { handlers } from './handlers.js';

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
  return model.create(attrs);
}

function createModelList(modelName, count, attrs = {}) {
  const model = db[modelName];
  if (!model) {
    throw new Error(`Model '${modelName}' not found in database`);
  }

  return Array.from({ length: count }, (_, i) => {
    // Call functions with index if needed (like Mirage factories)
    const resolvedAttrs = {};
    for (const [key, value] of Object.entries(attrs)) {
      resolvedAttrs[key] = typeof value === 'function' ? value(i) : value;
    }
    return model.create(resolvedAttrs);
  });
}
