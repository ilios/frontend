import Service from '@ember/service';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, waitFor } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'ilios/config/environment';

const { apiVersion } = ENV.APP;

module('Integration | Component | api version check', function(hooks) {
  setupRenderingTest(hooks);

  test('shows no warning when versions match', async function(assert) {
    const iliosConfigMock = Service.extend({
      apiVersion: resolve(apiVersion)
    });
    const warningOverlay = '.api-version-check-warning';
    this.owner.register('service:iliosConfig', iliosConfigMock);
    await render(hbs`{{api-version-check}}`);
    await waitFor('[data-test-load-finished]');
    await settled();
    assert.equal(document.querySelectorAll(warningOverlay).length, 0);
  });

  test('shows warning on mismatch', async function(assert) {
    const iliosConfigMock = Service.extend({
      apiVersion: resolve('bad')
    });
    const warningOverlay = '.api-version-check-warning';
    this.owner.register('service:iliosConfig', iliosConfigMock);
    await render(hbs`{{api-version-check}}`);
    await waitFor('[data-test-load-finished]');
    await settled();
    assert.equal(document.querySelectorAll(warningOverlay).length, 1);
  });
});
