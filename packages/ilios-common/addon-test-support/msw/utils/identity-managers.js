import { IdentityManager } from './identity-manager.js';
import { modelsWithStringIds } from '../db.js';

const identityManagers = new Map();

function getIdentityManager(modelName) {
  if (!identityManagers.has(modelName)) {
    identityManagers.set(modelName, new IdentityManager(modelsWithStringIds.has(modelName)));
  }

  return identityManagers.get(modelName);
}

function resetIdentityManagers() {
  identityManagers.forEach((idm) => idm.reset());
}

export { resetIdentityManagers, getIdentityManager };
