import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitUntil } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import component from 'ilios/tests/pages/components/loading-bar';

module('Integration | Component | loading bar', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    this.set('isLoading', true);
    // don't `await` this render as the internal task that never stops will keep this test running forever
    render(hbs`<LoadingBar @isLoading={{this.isLoading}} />`);
    await waitUntil(() => {
      const value = parseInt(component.bar.value, 10);
      return value > 0;
    });
    assert.ok(parseInt(component.bar.value, 10) > 0);
    this.set('isLoading', false);
    await waitUntil(() => {
      const value = parseInt(component.bar.value, 10);
      return value === 0;
    });
    assert.strictEqual(parseInt(component.bar.value, 10), 0);
  });
});
