import { visit, waitFor } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

const url = '/';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios-common/page-objects/components/api-version-notice';

module('Acceptance | API Version Check', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school });
  });

  test('No warning shows up when api versions match', async function (assert) {
    assert.expect(3);
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    assert.ok(apiVersion);
    this.server.get('application/config', function () {
      assert.ok(true, 'our config override was called');
      return {
        config: {
          type: 'form',
          apiVersion,
        },
      };
    });

    await visit(url);
    await waitFor('[data-test-load-finished]');
    assert.ok(component.notMismatched);
  });

  test('Warning shows up when api versions do not match', async function (assert) {
    assert.expect(2);
    this.server.get('application/config', function () {
      assert.ok(true, 'our config override was called');
      return {
        config: {
          type: 'form',
          apiVersion: 'v0.bad',
        },
      };
    });

    await visit(url);
    await waitFor('[data-test-load-finished]');
    assert.ok(component.mismatched);
  });
});
