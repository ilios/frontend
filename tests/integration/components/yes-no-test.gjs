import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/yes-no';
import YesNo from 'frontend/components/yes-no';

module('Integration | Component | yes-no', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders yes', async function (assert) {
    await render(<template><YesNo @value={{true}} /></template>);
    assert.strictEqual(component.text, 'Yes');
    assert.ok(component.yes);
    assert.notOk(component.no);
  });

  test('it renders no', async function (assert) {
    await render(<template><YesNo @value={{false}} /></template>);
    assert.strictEqual(component.text, 'No');
    assert.notOk(component.yes);
    assert.ok(component.no);
  });
});
