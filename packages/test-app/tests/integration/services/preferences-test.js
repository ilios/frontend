import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMSW } from 'ilios-common/msw';
import { HttpResponse } from 'msw';

const URL = '/application/preferences';

module('Unit | Service | preferences', function (hooks) {
  setupTest(hooks);
  setupMSW(hooks);

  test('it exists', function (assert) {
    var service = this.owner.lookup('service:preferences');
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
      return await request.json();
    });

    await service.setup();

    assert.strictEqual(service.locale, undefined);
    assert.verifySteps(['get preferences', 'put preferences']);
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

  test('locale is undefined when no locale preference has been set', async function (assert) {
    const service = this.owner.lookup('service:preferences');

    this.server.get(URL, function () {
      return {
        version: 1,
        preferences: {},
      };
    });

    await service.setup();

    assert.strictEqual(service.locale, undefined);
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

  test('setLocale() sets the locale and it can then be read back', async function (assert) {
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
