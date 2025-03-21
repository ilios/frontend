import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | courses/loading-list', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Courses::LoadingList />`);
    assert.dom('table').hasAttribute('aria-hidden', 'true');
    assert.dom('tbody').exists();
  });
});
