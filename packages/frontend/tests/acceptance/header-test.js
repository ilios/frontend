import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'frontend/tests/helpers';
import { setupAuthentication, freezeDateAt, unfreezeDate } from 'ilios-common';
import percySnapshot from '@percy/ember';

module('Acceptance | header', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    freezeDateAt(new Date('9/19/2029'));
  });

  hooks.afterEach(() => {
    unfreezeDate();
  });

  test('privileged users can view search', async function (assert) {
    assert.expect(1);
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          searchEnabled: true,
          apiVersion,
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
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          searchEnabled: false,
          apiVersion,
        },
      };
    });
    await setupAuthentication({}, true);
    await visit('/');
    await percySnapshot(assert);
    assert.dom('.global-search-box').doesNotExist();
  });

  test('students can not view search', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          searchEnabled: true,
          apiVersion,
        },
      };
    });
    await setupAuthentication();
    await visit('/');
    assert.dom('.global-search-box').doesNotExist();
  });
});
