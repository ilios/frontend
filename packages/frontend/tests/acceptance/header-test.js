import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
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
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      assert.step('API called');
      return {
        config: {
          searchEnabled: true,
          apiVersion,
        },
      };
    });
    await setupAuthentication({}, true);
    await visit('/');
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.dom('.global-search-box').exists();
    assert.verifySteps(['API called']);
  });

  test('when search is disabled on the server it does not display', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      assert.step('API called');
      return {
        config: {
          searchEnabled: false,
          apiVersion,
        },
      };
    });
    await setupAuthentication({}, true);
    await visit('/');
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.dom('.global-search-box').doesNotExist();
    assert.verifySteps(['API called']);
  });

  test('students can not view search', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      assert.step('API called');
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
    assert.verifySteps(['API called']);
  });
});
