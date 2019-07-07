import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitFor } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/api-version-notice';

module('Integration | Component | api-version-notice', function(hooks) {
  setupRenderingTest(hooks);

  test('hidden when version match', async function (assert) {
    const apiVersionMock = Service.extend({
      isMismatched: false,
    });
    this.owner.register('service:apiVersion', apiVersionMock);
    await render(hbs`<ApiVersionNotice />`);
    await waitFor('[data-test-load-finished]');
    assert.ok(component.isHidden);
    assert.ok(component.notMismatched);
    assert.ok(component.htmlHidden);
  });

  test('visible when versions do not match', async function (assert) {
    const apiVersionMock = Service.extend({
      isMismatched: true,
    });
    this.owner.register('service:apiVersion', apiVersionMock);
    await render(hbs`<ApiVersionNotice />`);
    await waitFor('[data-test-load-finished]');
    assert.ok(component.isVisible);
    assert.ok(component.mismatched);
    assert.notOk(component.htmlHidden);
  });
});
