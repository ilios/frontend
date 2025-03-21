import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | courses/loading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Courses::Loading />`);
    assert.dom('section').hasAttribute('aria-hidden', 'true');
    assert.dom('.list').exists();
  });
});
