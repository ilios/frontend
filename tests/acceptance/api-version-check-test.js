import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import ENV from 'ilios/config/environment';
const { apiVersion } = ENV.APP;

let application;
let url = '/';

module('Acceptance: API Version Check', {
  beforeEach() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
  },

  afterEach() {
    destroyApp(application);
  }
});

test('No warning shows up when api versions match', function(assert) {
  assert.expect(2);
  server.get('application/config', function() {
    assert.ok(true, 'our config override was called');
    return { config: {
      type: 'form',
      apiVersion
    }};
  });
  const warningOverlay = '.api-version-check-warning';

  visit(url);
  andThen(() => {
    assert.equal($(warningOverlay).length, 0);
  });
});

test('Warning shows up when api versions do not match', function(assert) {
  assert.expect(2);
  server.get('application/config', function() {
    assert.ok(true, 'our config override was called');
    return { config: {
      type: 'form',
      apiVersion: 'v0.bad'
    }};
  });
  const warningOverlay = '.api-version-check-warning';

  visit(url);
  andThen(() => {
    assert.equal($(warningOverlay).length, 1);
  });
});