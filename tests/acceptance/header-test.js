import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupAuthentication } from 'ilios-common';

module('Acceptance | header', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('privileged users can view search', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          searchEnabled: true,
        },
      };
    });
    await setupAuthentication({}, true);
    await visit('/');
    assert.dom('.global-search-box').exists();
  });

  test('when search is disabled on the server it does not display', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          searchEnabled: false,
        },
      };
    });
    await setupAuthentication({}, true);
    await visit('/');
    assert.dom('.global-search-box').doesNotExist();
  });

  test('students can not view search', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          searchEnabled: true,
        },
      };
    });
    await setupAuthentication();
    await visit('/');
    assert.dom('.global-search-box').doesNotExist();
  });
});
