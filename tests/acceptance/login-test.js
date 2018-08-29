import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { resolve } from 'rsvp';
import Service from '@ember/service';

module('Acceptance | login', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /login', async function (assert) {
    assert.expect(2);
    const iliosConfigMock = Service.extend({
      authenticationType: resolve('form'),
      trackingEnabled: resolve(false),
      trackingCode: resolve(false),
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    await visit('/login');

    assert.equal(currentURL(), '/login');
    await a11yAudit();
    assert.ok(true);
  });
});
