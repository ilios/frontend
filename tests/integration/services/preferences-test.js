import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMSW } from 'ilios-common/msw';
import { HttpResponse } from 'msw';

const URL = '/application/preferences';
const DEFAULT_LOCALE = 'en-us';
const DEFAULT_THEME = 'system';

class LocalStorageMock extends Service {
  locale = undefined;
  theme = undefined;
}

class CurrentUserMock extends Service {
  currentUserId = 24;
}

module('Unit | Service | preferences', function (hooks) {
  setupTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:local-storage', LocalStorageMock);
    this.owner.register('service:current-user', CurrentUserMock);
  });

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:preferences');
    assert.ok(service);
  });

  test('setup() creates and saves default preferences when none exist (404)', async function (assert) {
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      assert.step('get preferences');
      return new HttpResponse(null, { status: 404 });
    });
    this.server.put(URL, async ({ request }) => {
      assert.step('put preferences');
      assert.deepEqual(await request.json(), {
        version: 1,
        preferences: {
          locale: DEFAULT_LOCALE,
          theme: DEFAULT_THEME,
        },
      });
      return {
        preferences: {
          locale: DEFAULT_LOCALE,
          theme: DEFAULT_THEME,
        },
      };
    });

    await service.setup();

    assert.strictEqual(service.locale, DEFAULT_LOCALE);
    assert.strictEqual(service.theme, DEFAULT_THEME);
    assert.verifySteps(['get preferences', 'put preferences']);
  });

  test('setup() uses the local storage when creating preferences', async function (assert) {
    const localStorage = this.owner.lookup('service:local-storage');
    localStorage.locale = 'fr';
    localStorage.theme = 'dark';
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return new HttpResponse(null, { status: 404 });
    });
    this.server.put(URL, async ({ request }) => {
      const body = await request.json();
      assert.strictEqual(body.preferences.locale, 'fr');
      assert.strictEqual(body.preferences.theme, 'dark');
      return body;
    });

    await service.setup();

    assert.strictEqual(service.locale, 'fr');
    assert.strictEqual(service.theme, 'dark');
  });

  test('setup() loads preferences when they already exist', async function (assert) {
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      assert.step('get preferences');
      return {
        version: 1,
        preferences: {
          locale: 'es',
          theme: 'light',
        },
      };
    });

    await service.setup();

    assert.strictEqual(service.locale, 'es');
    assert.strictEqual(service.theme, 'light');
    assert.verifySteps(['get preferences']);
  });

  test('setup() does nothing when no user is authenticated', async function (assert) {
    assert.expect(0);
    const service = this.owner.lookup('service:preferences');
    const currentUser = this.owner.lookup('service:current-user');
    currentUser.currentUserId = undefined;

    this.server.get(URL, function () {
      assert.step('skip');
    });

    await service.setup();
  });

  test('locale and theme returns the default when no locale preference has been set', async function (assert) {
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return {
        version: 1,
        preferences: {},
      };
    });

    await service.setup();

    assert.strictEqual(service.locale, DEFAULT_LOCALE);
    assert.strictEqual(service.theme, DEFAULT_THEME);
  });

  test('locale and theme returns the local storage value when no user preference has been set', async function (assert) {
    const localStorage = this.owner.lookup('service:local-storage');
    localStorage.locale = 'it';
    localStorage.theme = 'light';
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return {
        version: 1,
        preferences: {},
      };
    });

    await service.setup();

    assert.strictEqual(service.locale, 'it');
    assert.strictEqual(service.theme, 'light');
  });

  test('locale returns the stored preference before the local storage value', async function (assert) {
    const localStorage = this.owner.lookup('service:local-storage');
    localStorage.locale = 'it';
    localStorage.theme = 'system';
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return {
        version: 1,
        preferences: {
          locale: 'fr',
          theme: 'light',
        },
      };
    });

    await service.setup();

    assert.strictEqual(service.locale, 'fr');
    assert.strictEqual(service.theme, 'light');
  });

  test('returns the stored value when one has been set', async function (assert) {
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return {
        version: 1,
        preferences: {
          locale: 'fr',
          theme: 'dark',
        },
      };
    });

    await service.setup();

    assert.strictEqual(service.locale, 'fr');
    assert.strictEqual(service.theme, 'dark');
  });

  test('setLocale() sets the locale, saves it to local storage, and it can then be read back', async function (assert) {
    const localStorage = this.owner.lookup('service:local-storage');
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return {
        version: 1,
        preferences: {},
      };
    });
    await service.setup();

    this.server.put(URL, async ({ request }) => {
      assert.step('put preferences');
      return await request.json();
    });

    await service.setLocale('de');

    assert.strictEqual(service.locale, 'de');
    assert.strictEqual(localStorage.locale, 'de');
    assert.verifySteps(['put preferences']);
  });

  test('locale cannot be set directly', async function (assert) {
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return {
        version: 1,
        preferences: {},
      };
    });
    await service.setup();

    assert.throws(
      () => {
        service.locale = 'de';
      },
      /locale/i,
      'locale must be set through setLocale()',
    );
  });

  test('setTheme() sets the theme, saves it to local storage, and it can then be read back', async function (assert) {
    const localStorage = this.owner.lookup('service:local-storage');
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return {
        version: 1,
        preferences: {},
      };
    });
    await service.setup();

    this.server.put(URL, async ({ request }) => {
      assert.step('put preferences');
      return await request.json();
    });

    await service.setTheme('dark');

    assert.strictEqual(service.theme, 'dark');
    assert.strictEqual(localStorage.theme, 'dark');
    assert.verifySteps(['put preferences']);
  });

  test('theme cannot be set directly', async function (assert) {
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return {
        version: 1,
        preferences: {},
      };
    });
    await service.setup();

    assert.throws(
      () => {
        service.theme = 'foo';
      },
      /theme/i,
      'theme must be set through setTheme()',
    );
  });
});
