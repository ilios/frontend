import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | expand collapse button', function(hooks) {
  setupRenderingTest(hooks);


  test('renders with default value false', async function(assert) {
    assert.expect(1);
    await render(hbs`{{expand-collapse-button}}`);
    assert.dom('svg').hasClass('fa-plus');
  });

  test('clicking changes the icon and sends the action', async function(assert) {
    assert.expect(5);

    this.set('value', false);
    this.set('click', () => {
      assert.ok(true, 'button was clicked');
      this.set('value', !this.get('value'));
    });
    await render(hbs`{{expand-collapse-button value=value action=(action click)}}`);
    assert.dom('svg').hasClass('fa-plus');

    await click('svg');
    assert.dom('svg').hasClass('fa-minus');

    await click('svg');
    assert.dom('svg').hasClass('fa-plus');

  });
});
