import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | courses/root', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Courses::Root />`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      <Courses::Root>
        template block text
      </Courses::Root>
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
