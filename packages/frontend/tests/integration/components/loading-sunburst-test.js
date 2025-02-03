import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | loading-sunburst', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<LoadingSunburst />`);
    assert.dom('.loading-sunburst').exists();
    assert.dom('.loading-sunburst').hasStyle({ backgroundRepeat: 'no-repeat' });
  });
});
