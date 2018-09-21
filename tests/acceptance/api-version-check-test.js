import { visit } from '@ember/test-helpers';
/* eslint ember/no-global-jquery: 0 */
import $ from 'jquery';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import ENV from 'ilios/config/environment';
const { apiVersion } = ENV.APP;

let url = '/';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | API Version Check', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school });
  });

  test('No warning shows up when api versions match', async function(assert) {
    assert.expect(2);
    this.server.get('application/config', function() {
      assert.ok(true, 'our config override was called');
      return { config: {
        type: 'form',
        apiVersion
      }};
    });
    const warningOverlay = '.api-version-check-warning';

    await visit(url);
    assert.equal($(warningOverlay).length, 0);
  });

  test('Warning shows up when api versions do not match', async function(assert) {
    assert.expect(2);
    this.server.get('application/config', function() {
      assert.ok(true, 'our config override was called');
      return { config: {
        type: 'form',
        apiVersion: 'v0.bad'
      }};
    });
    const warningOverlay = '.api-version-check-warning';

    await visit(url);
    assert.equal($(warningOverlay).length, 1);
  });
});
