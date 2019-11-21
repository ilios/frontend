import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Modifier | handle-click-outside', function(hooks) {
  setupRenderingTest(hooks);

  test('clicking outside calls action', async function (assert) {
    assert.expect(1);
    this.set('click', () => {
      assert.ok(true);
    });
    await render(hbs`
      <div data-test-outside>
        <div {{handle-click-outside this.click}}></div>
      </div>
    `);
    await click('[data-test-outside]');
  });
  test('clicking inside does not call the action', async function (assert) {
    assert.expect(0);
    this.set('click', () => {
      assert.ok(false);
    });
    await render(hbs`
      <div>
        <div {{handle-click-outside this.click}} data-test-inside></div>
      </div>
    `);
    await click('[data-test-inside]');
  });
});
