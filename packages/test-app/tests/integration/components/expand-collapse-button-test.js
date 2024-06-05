import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | expand collapse button', function (hooks) {
  setupRenderingTest(hooks);

  test('renders with default value false', async function (assert) {
    this.set('action', () => {});
    await render(hbs`<ExpandCollapseButton @action={{this.action}} />
`);
    assert.dom('svg').hasClass('fa-plus');
  });

  test('clicking changes the icon and sends the action', async function (assert) {
    assert.expect(5);

    this.set('value', false);
    this.set('click', () => {
      assert.ok(true, 'button was clicked');
      this.set('value', !this.value);
    });
    await render(hbs`<ExpandCollapseButton @value={{this.value}} @action={{this.click}} />
`);
    assert.dom('svg').hasClass('fa-plus');

    await click('svg');
    assert.dom('svg').hasClass('fa-minus');

    await click('svg');
    assert.dom('svg').hasClass('fa-plus');
  });
});
