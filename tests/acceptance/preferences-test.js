import Service from '@ember/service';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest,setupAuthentication } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

class LocalStorageMock extends Service {
  locale = undefined;
  theme = undefined;
}

module('Acceptance | preferences from local storage', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:local-storage', LocalStorageMock);
  });

  test('default locale', async function (assert) {
    await visit('/');
    assert.strictEqual(window.document.documentElement.lang, 'en-us');
  });

  test('french locale', async function (assert) {
    const localStorage = this.owner.lookup('service:local-storage');
    localStorage.locale = 'fr';
    await visit('/');
    assert.strictEqual(window.document.documentElement.lang, 'fr');
  });

  test('spanish locale', async function (assert) {
    const localStorage = this.owner.lookup('service:local-storage');
    localStorage.locale = 'sp';
    await visit('/');
    assert.strictEqual(window.document.documentElement.lang, 'sp');
  });

  test('english locale', async function (assert) {
    const localStorage = this.owner.lookup('service:local-storage');
    localStorage.locale = 'en-us';
    await visit('/');
    assert.strictEqual(window.document.documentElement.lang, 'en-us');
  });

  test('default theme', async function (assert) {
    await visit('/');
    assert.strictEqual(window.document.documentElement.dataset.theme, 'system');
  });

  test('dark theme', async function (assert) {
    const localStorage = this.owner.lookup('service:local-storage');
    localStorage.theme = 'dark';
    await visit('/');
    assert.strictEqual(window.document.documentElement.dataset.theme, 'dark');
  });

  test('light theme', async function (assert) {
    const localStorage = this.owner.lookup('service:local-storage');
    localStorage.theme = 'light';
    await visit('/');
    assert.strictEqual(window.document.documentElement.dataset.theme, 'light');
  });

  test('preferences wins for theme and locale', async function (assert) {
    const localStorage = this.owner.lookup('service:local-storage');
    localStorage.theme = 'dark';
    localStorage.locale = 'en-us';
    await setupAuthentication();
    this.server.get('/application/preferences', function () {
      return {
        version: 1,
        preferences: {
          locale: 'fr',
          theme: 'light',
        },
      };
    });

    await visit('/');
    assert.strictEqual(window.document.documentElement.lang, 'fr');
    assert.strictEqual(window.document.documentElement.dataset.theme, 'light');
  });
});
