import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMSW } from 'ilios-common/msw';
import { HttpResponse } from 'msw';

const URL = '/application/preferences';
const DEFAULT_LOCALE = 'en-us';

class LocalStorageMock extends Service {
  locale = undefined;
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
        },
      });
      return {
        preferences: {
          locale: DEFAULT_LOCALE,
        },
      };
    });

    await service.setup();

    assert.strictEqual(service.locale, DEFAULT_LOCALE);
    assert.verifySteps(['get preferences', 'put preferences']);
  });

  test('setup() uses the local storage locale when creating preferences', async function (assert) {
    const localStorage = this.owner.lookup('service:local-storage');
    localStorage.locale = 'fr';
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return new HttpResponse(null, { status: 404 });
    });
    this.server.put(URL, async ({ request }) => {
      const body = await request.json();
      assert.strictEqual(body.preferences.locale, 'fr');
      return body;
    });

    await service.setup();

    assert.strictEqual(service.locale, 'fr');
  });

  test('setup() loads preferences when they already exist', async function (assert) {
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      assert.step('get preferences');
      return {
        version: 1,
        preferences: {
          locale: 'es',
        },
      };
    });

    await service.setup();

    assert.strictEqual(service.locale, 'es');
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

  test('locale returns the default when no locale preference has been set', async function (assert) {
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return {
        version: 1,
        preferences: {},
      };
    });

    await service.setup();

    assert.strictEqual(service.locale, DEFAULT_LOCALE);
  });

  test('locale returns the local storage value when no user preference has been set', async function (assert) {
    const localStorage = this.owner.lookup('service:local-storage');
    localStorage.locale = 'it';
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return {
        version: 1,
        preferences: {},
      };
    });

    await service.setup();

    assert.strictEqual(service.locale, 'it');
  });

  test('locale returns the stored preference before the local storage value', async function (assert) {
    const localStorage = this.owner.lookup('service:local-storage');
    localStorage.locale = 'it';
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return {
        version: 1,
        preferences: {
          locale: 'fr',
        },
      };
    });

    await service.setup();

    assert.strictEqual(service.locale, 'fr');
  });

  test('locale returns the stored value when one has been set', async function (assert) {
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return {
        version: 1,
        preferences: {
          locale: 'fr',
        },
      };
    });

    await service.setup();

    assert.strictEqual(service.locale, 'fr');
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
});
