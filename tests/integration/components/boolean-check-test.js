import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | boolean-check', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('value', false);
    await render(hbs`<BooleanCheck @value={{this.value}} />`);

    assert.dom('span').hasText('');
    assert.dom('span').hasClass('checkbox');
    assert.dom('input').exists();
    assert.dom('input').isNotChecked();

    this.set('value', true);
    assert.dom('input').isChecked();
  });
});
