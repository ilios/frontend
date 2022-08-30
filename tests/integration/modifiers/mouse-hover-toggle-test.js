import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Modifier | mouse-hover-toggle', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('action is fired with correct value', async function (assert) {
    assert.expect(2);
    this.set('action', (val) => {
      assert.ok(val);
    });
    await render(hbs`<div id="theTestElement" {{mouse-hover-toggle this.action}}></div>`);
    await triggerEvent('#theTestElement', 'mouseover');
    this.set('action', (val) => {
      assert.notOk(val);
    });
    await triggerEvent('#theTestElement', 'mouseout');
  });
});
