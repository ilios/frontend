import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | expand collapse button', function(hooks) {
  setupRenderingTest(hooks);

  test('clicking changes the icon and sends the action', async function(assert) {
    assert.expect(5);

    this.set('value', false);
    this.set('click', () => {
      assert.ok(true, 'button was clicked');
      this.set('value', !this.get('value'));
    });
    await render(hbs`{{expand-collapse-button value=value action='click'}}`);
    assert.ok(find('svg').classList.contains('fa-plus'));

    await click('svg');
    assert.ok(find('svg').classList.contains('fa-minus'));

    await click('svg');
    assert.ok(find('svg').classList.contains('fa-plus'));

  });
});
