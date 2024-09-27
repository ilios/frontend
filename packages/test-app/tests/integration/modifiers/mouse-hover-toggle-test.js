import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | mouse-hover-toggle', function (hooks) {
  setupRenderingTest(hooks);

  test('action is fired with correct value', async function (assert) {
    assert.expect(2);
    this.set('action', (val) => {
      assert.ok(val);
    });
    await render(hbs`<div id='theTestElement' {{mouse-hover-toggle this.action}}></div>`);
    await triggerEvent('#theTestElement', 'mouseover');
    this.set('action', (val) => {
      assert.notOk(val);
    });
    await triggerEvent('#theTestElement', 'mouseout');
  });
});
