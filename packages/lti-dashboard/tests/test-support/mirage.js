import startMirage from './mirage-server';
import { settled } from '@ember/test-helpers';

export function setupMirage(hooks) {
  hooks.beforeEach(function () {
    if (!this.owner) {
      throw new Error(
        'Must call one of the ember-qunit setupTest() / setupRenderingTest() / setupApplicationTest() first',
      );
    }

    this.server = startMirage();
  });

  hooks.afterEach(function () {
    return settled().then(() => {
      if (this.server) {
        this.server.shutdown();
        delete this.server;
      }
    });
  });
}
