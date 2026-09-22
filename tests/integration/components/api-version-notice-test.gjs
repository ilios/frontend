import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/api-version-notice';
import ApiVersionNotice from 'frontend/components/api-version-notice';

module('Integration | Component | api-version-notice', function (hooks) {
  setupRenderingTest(hooks);

  test('hidden when version match', async function (assert) {
    class ApiVersionMock extends Service {
      async getIsMismatched() {
        return false;
      }
    }
    this.owner.register('service:apiVersion', ApiVersionMock);
    await render(<template><ApiVersionNotice /></template>);
    await waitFor('[data-test-load-finished]');
    assert.ok(component.isHidden);
    assert.ok(component.notMismatched);
    assert.ok(component.htmlHidden);
  });

  test('visible when versions do not match', async function (assert) {
    class ApiVersionMock extends Service {
      async getIsMismatched() {
        return true;
      }
    }
    this.owner.register('service:apiVersion', ApiVersionMock);
    await render(<template><ApiVersionNotice /></template>);
    await waitFor('[data-test-load-finished]');
    assert.ok(component.isVisible);
    assert.ok(component.mismatched);
    assert.notOk(component.htmlHidden);
  });
});
