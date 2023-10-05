import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | reports/root', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Reports::Root />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <Reports::Root>
        template block text
      </Reports::Root>
    `);

    assert.dom().hasText('template block text');
  });
});
