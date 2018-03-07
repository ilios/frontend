import { visit } from '@ember/test-helpers';
/* eslint ember/no-global-jquery: 0 */
import $ from 'jquery';
import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import ENV from 'ilios/config/environment';
const { apiVersion } = ENV.APP;

let application;
let url = '/';

module('Acceptance: API Version Check', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    server.create('school');
    setupAuthentication(application, { id: 4136,  schoolId: 1});
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('No warning shows up when api versions match', async function(assert) {
    assert.expect(2);
    server.get('application/config', function() {
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
    server.get('application/config', function() {
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
