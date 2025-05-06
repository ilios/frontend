import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, triggerEvent } from '@ember/test-helpers';
import mouseHoverToggle from 'ilios-common/modifiers/mouse-hover-toggle';

module('Integration | Modifier | mouse-hover-toggle', function (hooks) {
  setupRenderingTest(hooks);

  test('action is fired with correct value', async function (assert) {
    assert.expect(2);
    this.set('action', (val) => {
      assert.ok(val);
    });
    await render(
      <template>
        <div id="theTestElement" {{mouseHoverToggle this.action}}></div>
      </template>,
    );
    await triggerEvent('#theTestElement', 'mouseover');
    this.set('action', (val) => {
      assert.notOk(val);
    });
    await triggerEvent('#theTestElement', 'mouseout');
  });
});
