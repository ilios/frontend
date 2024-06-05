import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'frontend/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupAuthentication, freezeDateAt, unfreezeDate } from 'ilios-common';
import percySnapshot from '@percy/ember';

module('Acceptance | header', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    freezeDateAt(new Date('9/19/2029'));
  });

  hooks.afterEach(() => {
    unfreezeDate();
  });

  test('privileged users can view search', async function (assert) {
    assert.expect(1);
    this.server.get('application/config', function () {
      return {
        config: {
          searchEnabled: true,
        },
      };
    });
    await setupAuthentication({}, true);
    await visit('/');
    await percySnapshot(assert);
    assert.dom('.global-search-box').exists();
  });

  test('when search is disabled on the server it does not display', async function (assert) {
    assert.expect(1);
    this.server.get('application/config', function () {
      return {
        config: {
          searchEnabled: false,
        },
      };
    });
    await setupAuthentication({}, true);
    await visit('/');
    await percySnapshot(assert);
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
